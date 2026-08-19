import { describe, expect, it } from "vitest";
import { interpretHandler } from "../api/interpret";

const readyPayload = {
  status: "ready",
  intent: {
    origin: "Москва",
    departureDate: "2026-09-10",
    returnDate: "2026-09-15",
    adults: 2,
    childrenAges: [],
    budgetRub: 120000,
    pace: "balanced",
    interests: ["еда"],
    desiredVibe: "тёплый отдых",
    allowedTransport: ["avia"],
    hotelPreferences: { mode: "choose_self" },
  },
  ideas: Array.from({ length: 8 }, (_, index) => ({
    id: `idea-${index}`,
    destination: `Город ${index}`,
    title: `Идея ${index}`,
    summary: "Неспешный маршрут с локальной кухней.",
    tags: ["еда"],
    vibe: "Подходит под ваш запрос.",
  })),
};

function providerResponse(payload: unknown): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const completeRequest = () => new Request("http://localhost/api/interpret", {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": "interpret-test" },
  body: JSON.stringify({
    locale: "ru-RU",
    prompt: "Из Москвы на 10.09.2026–15.09.2026, вдвоём, бюджет до 120000 рублей, хочется еды и моря",
  }),
});

describe("POST /api/interpret", () => {
  it("uses NeuralDeep first and validates eight structured ideas", async () => {
    const calls: string[] = [];
    const response = await interpretHandler(completeRequest(), {
      env: { NEURALDEEP_API_KEY: "neural-key", NEURALDEEP_MODEL: "deepseek-test" },
      fetchImpl: async (url) => {
        calls.push(String(url));
        return providerResponse(readyPayload);
      },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: "ready", generation: "llm" });
    expect(body.ideas).toHaveLength(8);
    expect(calls).toEqual(["https://api.neuraldeep.ru/v1/chat/completions"]);
  });

  it("falls through invalid provider JSON to deterministic Russian clarification", async () => {
    const calls: string[] = [];
    const response = await interpretHandler(new Request("http://localhost/api/interpret", {
      method: "POST",
      body: JSON.stringify({ locale: "ru-RU", prompt: "Хочу куда-нибудь в тепло" }),
    }), {
      env: { NEURALDEEP_API_KEY: "neural-key", YC_API_KEY: "yandex-key", YC_FOLDER_ID: "folder" },
      fetchImpl: async (url) => {
        calls.push(String(url));
        return providerResponse({ nope: true });
      },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("needs_clarification");
    expect(body.questions.length).toBeLessThanOrEqual(3);
    expect(body.questions.every((question: { prompt: string }) => /[А-Яа-яЁё]/.test(question.prompt))).toBe(true);
    expect(calls).toEqual([
      "https://api.neuraldeep.ru/v1/chat/completions",
      "https://ai.api.cloud.yandex.net/v1/responses",
    ]);
  });

  it("uses the deterministic fallback when providers are unavailable and returns ready for complete input", async () => {
    const response = await interpretHandler(completeRequest(), {
      fetchImpl: async () => new Response("upstream failure", { status: 503 }),
      env: { NEURALDEEP_API_KEY: "neural-key" },
    });
    const body = await response.json();
    expect(body).toMatchObject({ status: "ready", generation: "rule_fallback" });
    expect(body.ideas).toHaveLength(8);
    expect(body.intent.origin).toBe("Москва");
  });

  it("rejects malformed JSON and oversized bodies", async () => {
    const malformed = await interpretHandler(new Request("http://localhost/api/interpret", {
      method: "POST", body: "{not-json",
    }));
    expect(malformed.status).toBe(400);
    expect((await malformed.json()).code).toBe("INVALID_JSON");

    const oversized = await interpretHandler(new Request("http://localhost/api/interpret", {
      method: "POST",
      headers: { "content-length": "20000" },
      body: JSON.stringify({ locale: "ru-RU", prompt: "x" }),
    }));
    expect(oversized.status).toBe(413);
    expect((await oversized.json()).code).toBe("BODY_TOO_LARGE");
  });
});
