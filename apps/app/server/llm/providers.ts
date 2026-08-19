import { generatedOutputSchema, type GeneratedOutput, type InterpretRequest } from "./contracts";

export const NEURALDEEP_BASE_URL = "https://api.neuraldeep.ru/v1";
export const YANDEX_BASE_URL = "https://ai.api.cloud.yandex.net/v1";
const NEURALDEEP_TIMEOUT_MS = 15_000;
const YANDEX_TIMEOUT_MS = 30_000;

type Env = Record<string, string | undefined>;
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type ProviderOptions = {
  fetchImpl?: FetchLike;
  env?: Env;
};

export type ProviderResult = {
  output: GeneratedOutput;
  provider: "neuraldeep" | "yandex";
};

class ProviderError extends Error {
  readonly provider: "neuraldeep" | "yandex";

  constructor(provider: "neuraldeep" | "yandex", message: string) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
  }
}

function runtimeEnv(): Env {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Env };
  };
  return runtime.process?.env ?? {};
}

function getFetch(fetchImpl?: FetchLike): FetchLike {
  return fetchImpl ?? fetch;
}

function getTextFromResponse(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const value = body as Record<string, unknown>;

  if (typeof value.output_text === "string") return value.output_text;
  if (typeof value.text === "string") return value.text;

  const choices = value.choices;
  if (Array.isArray(choices)) {
    const message = choices[0] && typeof choices[0] === "object"
      ? (choices[0] as Record<string, unknown>).message
      : undefined;
    if (message && typeof message === "object") {
      const content = (message as Record<string, unknown>).content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        const text = content.find((part) => part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string");
        if (text && typeof text === "object") return (text as Record<string, string>).text;
      }
    }
  }

  const output = value.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (!item || typeof item !== "object") continue;
      const content = (item as Record<string, unknown>).content;
      if (!Array.isArray(content)) continue;
      const text = content.find((part) => part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string");
      if (text && typeof text === "object") return (text as Record<string, string>).text;
    }
  }

  return undefined;
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("Provider returned non-JSON content");
  }
}

async function callProvider(
  provider: "neuraldeep" | "yandex",
  url: string,
  headers: Record<string, string>,
  body: unknown,
  fetchImpl: FetchLike,
): Promise<GeneratedOutput> {
  const controller = new AbortController();
  const timeoutMs = provider === "yandex" ? YANDEX_TIMEOUT_MS : NEURALDEEP_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw new ProviderError(provider, "upstream request failed");
    }
    if (!response.ok) throw new ProviderError(provider, `upstream returned ${response.status}`);

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ProviderError(provider, "upstream response was not JSON");
    }
    const text = getTextFromResponse(payload);
    if (!text) throw new ProviderError(provider, "upstream response had no text");

    let parsed: unknown;
    try {
      parsed = parseJsonText(text);
    } catch {
      throw new ProviderError(provider, "upstream content was not JSON");
    }
    const result = generatedOutputSchema.safeParse(parsed);
    if (!result.success) throw new ProviderError(provider, "upstream JSON did not match schema");
    return result.data;
  } finally {
    clearTimeout(timeout);
  }
}

function providerPrompt(request: InterpretRequest): string {
  return [
    "Ты — Travel Tinder, планировщик путешествий для России. Отвечай только валидным JSON без markdown.",
    "Не выдумывай цены, расписания, наличие билетов или отелей: их получает отдельный live Tutu MCP слой.",
    "Если критичных данных не хватает (город отправления, точные даты туда/обратно, состав группы или бюджет), верни status needs_clarification и не придумывай значения.",
    "Если данных хватает, верни status ready, intent и ровно 8 разных DestinationIdea на русском языке.",
    "Формат ready: {status, intent, ideas}. intent: origin, departureDate, returnDate, adults, childrenAges, budgetRub, pace (slow|balanced|active), interests, desiredVibe, allowedTransport, hotelPreferences.",
    "allowedTransport — обязательно JSON-массив значений avia|rail|bus|multitransport; hotelPreferences — объект вида {mode:'choose_self'}.",
    "Каждая из 8 ideas обязана иметь ровно смысловые поля: id, title, destination, summary, tags (массив строк), vibe. Не используй name/description/transport вместо них.",
    "Формат needs_clarification: {status, questions:[{id,prompt,options?}], draftIntent}. Не более 3 коротких полезных вопросов.",
    `Запрос пользователя: ${request.prompt}`,
    request.answers ? `Ответы пользователя: ${JSON.stringify(request.answers)}` : "",
  ].filter(Boolean).join("\n");
}

export async function generateWithProviders(
  request: InterpretRequest,
  options: ProviderOptions = {},
): Promise<ProviderResult | undefined> {
  const env = options.env ?? runtimeEnv();
  const fetchImpl = getFetch(options.fetchImpl);
  const prompt = providerPrompt(request);

  const neuralKey = env.NEURALDEEP_API_KEY?.trim();
  if (neuralKey) {
    try {
      const output = await callProvider(
        "neuraldeep",
        `${NEURALDEEP_BASE_URL}/chat/completions`,
        { authorization: `Bearer ${neuralKey}` },
        {
          model: env.NEURALDEEP_MODEL?.trim() || "qwen3.6-35b-a3b-noreason",
          messages: [
            { role: "system", content: "Верни только JSON, соответствующий описанной схеме." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 2_500,
          // NeuralDeep's OpenAI-compatible JSON mode is materially faster for
          // the demo model. The complete result is still rejected unless it
          // passes generatedOutputSchema below.
          response_format: { type: "json_object" },
        },
        fetchImpl,
      );
      return { output, provider: "neuraldeep" };
    } catch {
      // Provider failures are intentionally silent: the next provider/fallback is user-safe.
    }
  }

  const yandexKey = (env.YC_API_KEY ?? env.YANDEX_API_KEY)?.trim();
  const folderId = (env.YC_FOLDER_ID ?? env.YANDEX_FOLDER_ID)?.trim();
  if (yandexKey && folderId) {
    try {
      const output = await callProvider(
        "yandex",
        `${YANDEX_BASE_URL}/responses`,
        { authorization: `Api-Key ${yandexKey}`, "x-folder-id": folderId },
        {
          model: env.YANDEX_MODEL?.trim() || `gpt://${folderId}/qwen3.6-35b-a3b`,
          input: prompt,
          temperature: 0.2,
          // Reasoning-capable Yandex models count hidden reasoning in this
          // budget before emitting the JSON message.
          max_output_tokens: 6_000,
          text: {
            // JSON mode avoids model-specific strict-schema restrictions; the
            // complete payload is still validated by generatedOutputSchema.
            format: { type: "json_object" },
          },
        },
        fetchImpl,
      );
      return { output, provider: "yandex" };
    } catch {
      // Fall through to the deterministic parser below.
    }
  }

  return undefined;
}
