import { z } from "zod";

/**
 * A checkout ref is intentionally opaque to the application.  Tutu emits
 * the fields needed by `create_checkout_link`; copying this object verbatim
 * is safer than attempting to understand or reconstruct its id spaces.
 */
export const CheckoutRefSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).length > 0, "checkoutRef must not be empty");

export const CheckoutRequestSchema = z
  .object({
    checkoutRef: CheckoutRefSchema.optional(),
    // Keep the MCP spelling as a compatibility alias for callers forwarding
    // a package's raw checkout_ref field.
    checkout_ref: CheckoutRefSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.checkoutRef && !value.checkout_ref) {
      context.addIssue({
        code: "custom",
        path: ["checkoutRef"],
        message: "checkoutRef is required",
      });
    }

    if (value.checkoutRef && value.checkout_ref) {
      context.addIssue({
        code: "custom",
        path: ["checkoutRef"],
        message: "provide only one checkoutRef field",
      });
    }
  });

export type CheckoutRef = z.infer<typeof CheckoutRefSchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export type CheckoutResponse = {
  url: string;
  kind: string;
  fallbackUrl?: string;
  note?: string;
  requestId: string;
};

export type CheckoutErrorBody = {
  code: string;
  message: string;
  retryable: boolean;
  requestId: string;
  stage: "checkout" | "mcp-call" | "validation";
};

/** Return true only for HTTPS URLs on Tutu's domain tree. */
export function isAllowedTutuUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isTutuHost = host === "tutu.ru" || host.endsWith(".tutu.ru");

    return (
      url.protocol === "https:" &&
      isTutuHost &&
      url.username === "" &&
      url.password === "" &&
      // URL normalizes the default HTTPS port (`:443`) to an empty string;
      // any remaining value is a non-default port and must be rejected.
      url.port === ""
    );
  } catch {
    return false;
  }
}

export function assertAllowedTutuUrl(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0 || !isAllowedTutuUrl(value)) {
    throw new CheckoutPayloadError(
      "MCP_INVALID_URL",
      `Tutu returned an invalid ${field} URL.`,
      false,
    );
  }

  // Do not return URL.href: it can normalize escaping, casing, or parameter
  // order. The original string is the opaque checkout handle.
  return value;
}

export class CheckoutPayloadError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;

  public constructor(code: string, message: string, retryable: boolean) {
    super(message);
    this.name = "CheckoutPayloadError";
    this.code = code;
    this.retryable = retryable;
  }
}

export class CheckoutMcpError extends Error {
  public readonly retryable: boolean;

  public constructor(message: string, retryable = true) {
    super(message);
    this.name = "CheckoutMcpError";
    this.retryable = retryable;
  }
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeCheckoutPayload(value: RecordValue): boolean {
  return [
    "checkout_url",
    "checkoutUrl",
    "url",
    "search_results_url",
    "searchResultsUrl",
    "fallback_url",
    "fallbackUrl",
    "kind",
  ].some((key) => key in value);
}

function parseJsonText(value: unknown): unknown {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Some MCP servers wrap JSON in a markdown fence. This is only a parser
    // fallback; URLs still pass through the strict allowlist below.
    const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1];
    if (!fenced) return undefined;

    try {
      return JSON.parse(fenced) as unknown;
    } catch {
      return undefined;
    }
  }
}

/** Extract a structured checkout payload from either MCP result surface. */
export function extractCheckoutPayload(result: unknown): RecordValue {
  if (!isRecord(result)) {
    throw new CheckoutPayloadError("MCP_INVALID_RESPONSE", "MCP returned an invalid response.", false);
  }

  if (result.isError === true) {
    throw new CheckoutMcpError("Tutu could not create a checkout link.", false);
  }

  const candidates: unknown[] = [result.structuredContent, result];
  if (Array.isArray(result.content)) {
    for (const block of result.content) {
      if (isRecord(block) && block.type === "text") {
        candidates.push(parseJsonText(block.text));
      }
    }
  }

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      // A few MCP adapters wrap structured output in `data`; unwrap only the
      // object, never URLs or individual scalar values.
      if (isRecord(candidate.data)) return candidate.data;
      if (looksLikeCheckoutPayload(candidate)) return candidate;
      continue;
    }

    const parsed = parseJsonText(candidate);
    if (isRecord(parsed)) return parsed;
  }

  throw new CheckoutPayloadError(
    "MCP_INVALID_RESPONSE",
    "Tutu returned no structured checkout payload.",
    false,
  );
}

function optionalUrl(payload: RecordValue, keys: string[], field: string): string | undefined {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) {
      return assertAllowedTutuUrl(payload[key], field);
    }
  }
  return undefined;
}

/** Normalize the MCP payload while preserving all URL strings byte-for-byte. */
export function normalizeCheckoutPayload(result: unknown): Omit<CheckoutResponse, "requestId"> {
  const payload = extractCheckoutPayload(result);
  const checkoutUrl = optionalUrl(payload, ["checkout_url", "checkoutUrl", "url"], "checkout");
  const searchUrl = optionalUrl(
    payload,
    ["search_results_url", "searchResultsUrl"],
    "search",
  );
  const fallbackUrl = optionalUrl(
    payload,
    ["fallback_url", "fallbackUrl"],
    "fallback",
  );

  const url = checkoutUrl ?? searchUrl ?? fallbackUrl;
  if (!url) {
    throw new CheckoutPayloadError(
      "MCP_INVALID_RESPONSE",
      "Tutu returned no checkout or fallback URL.",
      false,
    );
  }

  const rawKind = payload.kind;
  const kind = typeof rawKind === "string" && rawKind.length > 0 ? rawKind : "deeplink";
  // Known fallback kinds (`search_redirect`, `hotel_page`, `order_url`, and
  // `seats_url`) are successful responses. Unknown future kinds are retained
  // for forward compatibility and are not treated as failures.

  const rawNote = payload.fallback_note ?? payload.fallbackNote ?? payload.note;
  const note = typeof rawNote === "string" && rawNote.length > 0 ? rawNote : undefined;

  return {
    url,
    kind,
    ...(fallbackUrl && fallbackUrl !== url ? { fallbackUrl } : {}),
    ...(note ? { note } : {}),
  };
}
