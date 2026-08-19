import {
  PackagesRequestSchema,
  extractPayload,
  getSearchInputs,
  readArray,
  readNumber,
  readObject,
  readString,
  type PackageCallResult,
  type PackageCallTool,
  type PackageOptions,
  type PackagesRequest,
  type PackagesResponse,
  type SearchInputs,
  type SourceEvidence,
  type SourceWarning,
  type TripPackage,
} from "./contracts";

const MCP_CALL_TIMEOUT_MS = 12_000;
const ROUTE_TIMEOUT_MS = 20_000;

type SearchOutcome = { result?: PackageCallResult; error?: unknown };

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`MCP route timed out after ${timeoutMs}ms`)), timeoutMs);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error: unknown) => { clearTimeout(timer); reject(error); });
  });
}

function errorWarning(source: SourceWarning["source"], code: string, message: string, retryable = true): SourceWarning {
  return { source, code, message, retryable };
}

function numberFromPrice(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "object" || value === null) return undefined;
  return readNumber(value as Record<string, unknown>, "amount", "value", "total");
}

function currencyFromPrice(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  return readString(value as Record<string, unknown>, "currency", "currency_code");
}

function firstPrice(record: Record<string, unknown>): { amount?: number; currency?: string } {
  const candidates = [record.price, record.total_price, record.total, record.min_price, record.price_from];
  for (const candidate of candidates) {
    const amount = numberFromPrice(candidate);
    if (amount !== undefined) return { amount, currency: currencyFromPrice(candidate) };
  }
  return {};
}

function getTransportVariants(payload: Record<string, unknown>): Record<string, unknown>[] {
  const direct = readArray(payload, "variants", "offers", "results", "items");
  return direct.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item));
}

function getHotels(payload: Record<string, unknown>): Record<string, unknown>[] {
  const direct = readArray(payload, "hotels", "results", "offers", "items");
  return direct.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item));
}

function getMode(record: Record<string, unknown>): string {
  return readString(record, "mode", "product_type", "productType", "transport", "type") ?? "transport";
}

function buildPackages(
  inputs: SearchInputs,
  transportPayload: { outbound?: Record<string, unknown>; return?: Record<string, unknown> },
  hotelPayload: Record<string, unknown> | undefined,
  now: string,
): TripPackage[] {
  const transports = transportPayload.outbound ? getTransportVariants(transportPayload.outbound).slice(0, 2) : [];
  const returnTransports = transportPayload.return ? getTransportVariants(transportPayload.return).slice(0, 2) : [];
  const hotels = hotelPayload ? getHotels(hotelPayload).slice(0, 2) : [];
  const packages: TripPackage[] = [];

  for (let index = 0; index < Math.max(transports.length, 1) && packages.length < 2; index += 1) {
    const transport = transports[index];
    const returnTransport = returnTransports[index] ?? returnTransports[0];
    const hotel = hotels[index % Math.max(hotels.length, 1)];
    const transportPrice = transport ? firstPrice(transport) : {};
    const hotelOffer = hotel ? readObject(hotel, "best_offer", "bestOffer", "offer") : undefined;
    const hotelPrice = hotelOffer ? firstPrice(hotelOffer) : hotel ? firstPrice(hotel) : {};
    const returnPrice = returnTransport ? firstPrice(returnTransport) : {};
    const transportAmount = transportPrice.amount !== undefined && returnPrice.amount !== undefined
      ? transportPrice.amount + returnPrice.amount
      : transportPrice.amount ?? returnPrice.amount;
    const hotelAmount = hotelPrice.amount;
    if (transportAmount === undefined && hotelAmount === undefined) continue;

    // Multitransport is intentionally called once per leg. Two one-way prices
    // are never a provider-confirmed round-trip fare, even if an upstream row
    // happens to carry a similarly named flag.
    const exact = false;
    const amount = (transportAmount ?? 0) + (hotelAmount ?? 0);
    const checkoutRef = transport ? transport.checkout_ref ?? transport.checkoutRef : undefined;
    const hotelCheckoutRef = hotelOffer ? hotelOffer.checkout_ref ?? hotelOffer.checkoutRef : hotel?.checkout_ref ?? hotel?.checkoutRef;
    packages.push({
      id: `${inputs.destination.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-")}-${index + 1}`,
      title: `${inputs.destination}: ${index === 0 ? "оптимальный маршрут" : "альтернатива"}`,
      destination: inputs.destination,
      transport: {
        mode: getMode(transport ?? returnTransport ?? {}),
        ...(transportAmount !== undefined ? { price: transportAmount } : {}),
        ...((transportPrice.currency ?? returnPrice.currency) ? { currency: transportPrice.currency ?? returnPrice.currency } : {}),
        ...(transport ? { outbound: transport } : {}),
        ...(returnTransport ? { return: returnTransport } : {}),
        ...(checkoutRef !== undefined ? { checkoutRef } : {}),
      },
      ...(hotel ? {
        hotel: {
          name: readString(hotel, "name", "title", "hotel_name") ?? "Отель Tutu",
          ...(hotelAmount !== undefined ? { price: hotelAmount } : {}),
          ...(hotelPrice.currency ? { currency: hotelPrice.currency } : {}),
          ...(readNumber(hotel, "nights") !== undefined ? { nights: readNumber(hotel, "nights") } : {}),
          ...(hotelCheckoutRef !== undefined ? { checkoutRef: hotelCheckoutRef } : {}),
        },
      } : {}),
      price: {
        confidence: exact ? "exact_round_trip" : "estimated_split_trip",
        amount,
        currency: transportPrice.currency ?? returnPrice.currency ?? hotelPrice.currency ?? "RUB",
        ...(exact ? {} : { note: "Два отдельных билета или неполный ответ; цена может измениться" }),
      },
      breakdown: {
        ...(transportAmount !== undefined ? { transport: transportAmount } : {}),
        ...(hotelAmount !== undefined ? { hotel: hotelAmount } : {}),
      },
      source: "Tutu MCP",
      updatedAt: now,
    });
  }
  return packages;
}

function sourceEvidence(tool: SourceEvidence["tool"], status: SourceEvidence["status"], receivedAt: string, variants: number): SourceEvidence {
  return { tool, status, receivedAt, variants };
}

export async function buildPackagesResponse(request: PackagesRequest, options: PackageOptions = {}): Promise<PackagesResponse> {
  const parsed = PackagesRequestSchema.safeParse(request);
  const requestId = options.requestId ?? "packages-request";
  if (!parsed.success) {
    return {
      packages: [], warnings: [errorWarning("validation", "INVALID_REQUEST", "Invalid packages request.", false)],
      sources: [], requestId,
    };
  }
  const inputs = getSearchInputs(parsed.data);
  if ("error" in inputs) {
    const code = inputs.error.startsWith("Family pricing") ? "CHILDREN_UNSUPPORTED" : "INVALID_REQUEST";
    return { packages: [], warnings: [errorWarning("validation", code, inputs.error, false)], sources: [], requestId };
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const callTool = options.callTool;
  if (!callTool) throw new Error("Package MCP adapter is not configured");

  const transportArgs: Record<string, unknown> = {
    origin: inputs.origin, destination: inputs.destination,
    departure_date: inputs.departureDate,
    adults: inputs.adults, optimize_for: "price", page: 1, page_size: 10,
  };
  const returnTransportArgs: Record<string, unknown> = {
    origin: inputs.destination, destination: inputs.origin,
    departure_date: inputs.returnDate,
    adults: inputs.adults, optimize_for: "price", page: 1, page_size: 10,
  };
  const hotelArgs: Record<string, unknown> = {
    city_name: inputs.destination, check_in: inputs.departureDate, check_out: inputs.returnDate,
    adults: inputs.adults, page: 1, page_size: 10,
    ...inputs.hotelPreferences,
  };

  let settled: PromiseSettledResult<PackageCallResult>[];
  try {
    settled = await withTimeout(
      Promise.allSettled([
        callTool("search_multitransport", transportArgs, MCP_CALL_TIMEOUT_MS),
        callTool("search_multitransport", returnTransportArgs, MCP_CALL_TIMEOUT_MS),
        callTool("search_hotels", hotelArgs, MCP_CALL_TIMEOUT_MS),
      ]), ROUTE_TIMEOUT_MS,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP route failed";
    return {
      packages: [],
      warnings: [errorWarning("mcp", "MCP_ROUTE_TIMEOUT", message, true)],
      sources: [sourceEvidence("search_multitransport", "unavailable", now, 0), sourceEvidence("search_hotels", "unavailable", now, 0)],
      requestId,
    };
  }

  const outboundOutcome: SearchOutcome = settled[0].status === "fulfilled" ? { result: settled[0].value } : { error: settled[0].reason };
  const returnOutcome: SearchOutcome = settled[1].status === "fulfilled" ? { result: settled[1].value } : { error: settled[1].reason };
  const hotelOutcome: SearchOutcome = settled[2].status === "fulfilled" ? { result: settled[2].value } : { error: settled[2].reason };
  const outboundPayload = outboundOutcome.result ? extractPayload(outboundOutcome.result) : undefined;
  const returnPayload = returnOutcome.result ? extractPayload(returnOutcome.result) : undefined;
  const hotelPayload = hotelOutcome.result ? extractPayload(hotelOutcome.result) : undefined;
  const warnings: SourceWarning[] = [];
  if (outboundOutcome.error || !outboundPayload || outboundOutcome.result?.isError) warnings.push(errorWarning("transport", "OUTBOUND_UNAVAILABLE", "Tutu outbound transport search is unavailable.", true));
  if (returnOutcome.error || !returnPayload || returnOutcome.result?.isError) warnings.push(errorWarning("transport", "RETURN_UNAVAILABLE", "Tutu return transport search is unavailable.", true));
  if (hotelOutcome.error || !hotelPayload || hotelOutcome.result?.isError) warnings.push(errorWarning("hotel", "HOTEL_UNAVAILABLE", "Tutu hotel search is unavailable.", true));
  for (const payload of [outboundPayload, returnPayload]) {
    const meta = payload ? readObject(payload, "meta") : undefined;
    if (meta && readArray(meta, "unavailable").length > 0) warnings.push(errorWarning("transport", "TRANSPORT_PARTIAL", "Some transport modes are unavailable.", true));
  }
  const transportVariants = (outboundPayload ? getTransportVariants(outboundPayload).length : 0) + (returnPayload ? getTransportVariants(returnPayload).length : 0);
  const hotelVariants = hotelPayload ? getHotels(hotelPayload).length : 0;
  const packages = buildPackages(inputs, { outbound: outboundPayload, return: returnPayload }, hotelPayload, now);
  if (packages.length === 0 && warnings.length === 0) warnings.push(errorWarning("mcp", "NO_LIVE_OFFERS", "Tutu returned no usable offers.", false));
  return {
    packages,
    warnings,
    sources: [
      sourceEvidence("search_multitransport", outboundPayload || returnPayload ? (warnings.some((w) => w.source === "transport") ? "partial" : "ok") : "unavailable", now, transportVariants),
      sourceEvidence("search_hotels", hotelPayload ? (warnings.some((w) => w.source === "hotel") ? "partial" : "ok") : "unavailable", now, hotelVariants),
    ],
    requestId,
  };
}
