const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

/** Generate an opaque correlation id without including request data. */
export function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/** Reuse a safe inbound id when present; otherwise generate one. */
export function getRequestId(request: Request): string {
  const candidate = request.headers.get("x-request-id")?.trim();
  return candidate && REQUEST_ID_PATTERN.test(candidate) ? candidate : createRequestId();
}
