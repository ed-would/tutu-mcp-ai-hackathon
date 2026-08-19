import { MCP_DURATION_BUDGETS } from "../mcp/tools";
import {
  PackagesRequestSchema,
  extractPayload,
  getSearchInputs,
  readArray,
  readNumber,
  readObject,
  readString,
  type PackageCallResult,
  type PackageOptions,
  type PackageRole,
  type PackageToolName,
  type PackagesRequest,
  type PackagesResponse,
  type SearchInputs,
  type SourceEvidence,
  type SourceWarning,
  type TripPackage,
} from "./contracts";
import { packagePriceNote, preferenceSummary, rankPackages } from "./preference";

type SearchOutcome = { result?: PackageCallResult; error?: unknown };
type PlannedCall = { key: "avia" | "outbound" | "return" | "hotel"; tool: PackageToolName; args: Record<string, unknown> };

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

function checkoutRefOf(record: Record<string, unknown> | undefined): unknown {
  if (!record) return undefined;
  const nested = readObject(record, "checkout_ref", "checkoutRef");
  return nested ?? record.checkout_ref ?? record.checkoutRef;
}

function isMultiPnr(offer: Record<string, unknown>): boolean {
  return offer.is_multi_pnr === true || offer.isMultiPnr === true;
}

function isAviaRoundTrip(offer: Record<string, unknown>): boolean {
  if (isMultiPnr(offer)) return false;
  const ref = readObject(offer, "checkout_ref", "checkoutRef") ?? {};
  return ref.is_round_trip === true && Boolean(ref.return_departure_at ?? ref.returnDepartureAt);
}

function durationMinutes(offer: Record<string, unknown>): number {
  const direct = readNumber(offer, "duration_min", "durationMinutes", "duration", "travel_time");
  if (direct !== undefined) return direct;
  let total = 0;
  let found = false;
  for (const leg of readArray(offer, "legs")) {
    if (typeof leg !== "object" || leg === null) continue;
    const value = readNumber(leg as Record<string, unknown>, "duration_min", "duration");
    if (value === undefined) continue;
    total += value;
    found = true;
  }
  return found ? total : Number.POSITIVE_INFINITY;
}

function wants(inputs: SearchInputs, mode: SearchInputs["allowedTransport"][number]): boolean {
  return inputs.allowedTransport.includes(mode);
}

function aviaArgs(inputs: SearchInputs): Record<string, unknown> {
  return {
    origin: inputs.origin,
    destination: inputs.destination,
    departure_date: inputs.departureDate,
    return_date: inputs.returnDate,
    adults: inputs.party.aviaAdults,
    children: inputs.party.aviaChildren,
    infants: inputs.party.aviaInfants,
    sort: "price_asc",
    page: 1,
    page_size: 10,
  };
}

function busArgs(inputs: SearchInputs, direction: "out" | "return"): Record<string, unknown> {
  const origin = direction === "out" ? inputs.origin : inputs.destination;
  const destination = direction === "out" ? inputs.destination : inputs.origin;
  const departure_date = direction === "out" ? inputs.departureDate : inputs.returnDate;
  return {
    origin,
    destination,
    departure_date,
    adults: inputs.party.busAdults,
    children: inputs.party.busChildren,
    sort: "price_asc",
    page: 1,
    page_size: 10,
  };
}

function multiArgs(inputs: SearchInputs, direction: "out" | "return"): Record<string, unknown> {
  const origin = direction === "out" ? inputs.origin : inputs.destination;
  const destination = direction === "out" ? inputs.destination : inputs.origin;
  const departure_date = direction === "out" ? inputs.departureDate : inputs.returnDate;
  return {
    origin,
    destination,
    departure_date,
    adults: inputs.adults,
    optimize_for: "price",
    page: 1,
    page_size: 10,
  };
}

function hotelArgs(inputs: SearchInputs): Record<string, unknown> {
  return {
    city_name: inputs.destination,
    check_in: inputs.departureDate,
    check_out: inputs.returnDate,
    adults: Math.min(6, inputs.party.aviaAdults),
    page: 1,
    page_size: 10,
    ...inputs.hotelPreferences,
    ...(inputs.party.childrenAges.length > 0 ? { children_ages: inputs.party.childrenAges } : {}),
  };
}

function planCalls(inputs: SearchInputs): PlannedCall[] {
  const calls: PlannedCall[] = [];
  if (wants(inputs, "avia")) calls.push({ key: "avia", tool: "search_avia", args: aviaArgs(inputs) });
  if (inputs.party.isFamily) {
    if (wants(inputs, "bus")) {
      calls.push({ key: "outbound", tool: "search_bus", args: busArgs(inputs, "out") });
      calls.push({ key: "return", tool: "search_bus", args: busArgs(inputs, "return") });
    }
  } else if (wants(inputs, "multitransport") || wants(inputs, "rail")) {
    calls.push({ key: "outbound", tool: "search_multitransport", args: multiArgs(inputs, "out") });
    calls.push({ key: "return", tool: "search_multitransport", args: multiArgs(inputs, "return") });
  } else if (wants(inputs, "bus")) {
    calls.push({ key: "outbound", tool: "search_bus", args: busArgs(inputs, "out") });
    calls.push({ key: "return", tool: "search_bus", args: busArgs(inputs, "return") });
  }
  calls.push({ key: "hotel", tool: "search_hotels", args: hotelArgs(inputs) });
  return calls;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-");
}

function hotelFields(hotel: Record<string, unknown> | undefined): TripPackage["hotel"] | undefined {
  if (!hotel) return undefined;
  const hotelOffer = readObject(hotel, "best_offer", "bestOffer", "offer");
  const hotelPrice = hotelOffer ? firstPrice(hotelOffer) : firstPrice(hotel);
  const stay = readObject(hotel, "stay");
  const nights = readNumber(hotel, "nights") ?? (stay ? readNumber(stay, "nights") : undefined);
  const checkoutRef = checkoutRefOf(hotelOffer) ?? checkoutRefOf(hotel);
  return {
    name: readString(hotel, "name", "title", "hotel_name") ?? "Отель Tutu",
    ...(hotelPrice.amount !== undefined ? { price: hotelPrice.amount } : {}),
    ...(hotelPrice.currency ? { currency: hotelPrice.currency } : {}),
    ...(nights !== undefined ? { nights } : {}),
    ...(checkoutRef !== undefined ? { checkoutRef } : {}),
  };
}

function makePackage(input: {
  inputs: SearchInputs;
  role: PackageRole;
  now: string;
  outbound?: Record<string, unknown>;
  returning?: Record<string, unknown>;
  hotel?: Record<string, unknown>;
  exact: boolean;
  transportAmount?: number;
  transportCurrency?: string;
  checkoutRef?: unknown;
  returnCheckoutRef?: unknown;
  mode: string;
}): TripPackage | undefined {
  const hotel = hotelFields(input.hotel);
  if (input.transportAmount === undefined && hotel?.price === undefined) return undefined;
  const isPartial = !input.outbound || !input.returning || !hotel;
  const exact = input.exact && !isPartial && !isMultiPnr(input.outbound ?? {});
  const amount = (input.transportAmount ?? 0) + (hotel?.price ?? 0);
  return {
    id: `${slug(input.inputs.destination)}-${input.role}`,
    ...(input.inputs.ideaId ? { ideaId: input.inputs.ideaId } : {}),
    title: `${input.inputs.destination}: ${input.role === "optimal" ? "оптимальный маршрут" : "быстрее или комфортнее"}`,
    destination: input.inputs.destination,
    role: input.role,
    transport: {
      mode: input.mode,
      ...(input.transportAmount !== undefined ? { price: input.transportAmount } : {}),
      ...(input.transportCurrency ? { currency: input.transportCurrency } : {}),
      ...(input.outbound ? { outbound: input.outbound } : {}),
      ...(input.returning ? { return: input.returning } : {}),
      ...(input.checkoutRef !== undefined ? { checkoutRef: input.checkoutRef } : {}),
      ...(input.returnCheckoutRef !== undefined ? { returnCheckoutRef: input.returnCheckoutRef } : {}),
    },
    ...(hotel ? { hotel } : {}),
    price: {
      confidence: exact ? "exact_round_trip" : "estimated_split_trip",
      amount,
      currency: input.transportCurrency ?? hotel?.currency ?? "RUB",
      ...(exact ? {} : { note: packagePriceNote(isPartial) }),
    },
    breakdown: {
      ...(input.transportAmount !== undefined ? { transport: input.transportAmount } : {}),
      ...(hotel?.price !== undefined ? { hotel: hotel.price } : {}),
    },
    source: "Tutu MCP",
    updatedAt: input.now,
    timestamp: input.now,
    isPartial,
  };
}

function cheapest(offers: Record<string, unknown>[]): Record<string, unknown> | undefined {
  return [...offers].sort((left, right) => (firstPrice(left).amount ?? Number.POSITIVE_INFINITY) - (firstPrice(right).amount ?? Number.POSITIVE_INFINITY))[0];
}

function fastest(offers: Record<string, unknown>[], except?: Record<string, unknown>): Record<string, unknown> | undefined {
  return [...offers]
    .filter((offer) => offer !== except)
    .sort((left, right) => durationMinutes(left) - durationMinutes(right) || (firstPrice(left).amount ?? 0) - (firstPrice(right).amount ?? 0))[0];
}

function splitAmount(outbound?: Record<string, unknown>, returning?: Record<string, unknown>): { amount?: number; currency?: string } {
  const out = outbound ? firstPrice(outbound) : {};
  const back = returning ? firstPrice(returning) : {};
  const amount = out.amount !== undefined && back.amount !== undefined
    ? out.amount + back.amount
    : out.amount ?? back.amount;
  return { amount, currency: out.currency ?? back.currency };
}

function buildPackages(
  inputs: SearchInputs,
  payloads: {
    avia?: Record<string, unknown>;
    outbound?: Record<string, unknown>;
    returning?: Record<string, unknown>;
    hotel?: Record<string, unknown>;
  },
  now: string,
): TripPackage[] {
  const aviaRoundTrips = (payloads.avia ? getTransportVariants(payloads.avia) : []).filter((offer) => isAviaRoundTrip(offer) && !isMultiPnr(offer));
  const outbounds = payloads.outbound ? getTransportVariants(payloads.outbound) : [];
  const returns = payloads.returning ? getTransportVariants(payloads.returning) : [];
  const hotels = payloads.hotel ? getHotels(payloads.hotel) : [];
  const hotel = hotels[0];
  const packages: TripPackage[] = [];

  const optimalAvia = cheapest(aviaRoundTrips);
  if (optimalAvia) {
    const price = firstPrice(optimalAvia);
    const built = makePackage({
      inputs, role: "optimal", now, hotel, exact: true,
      outbound: optimalAvia, returning: optimalAvia,
      transportAmount: price.amount, transportCurrency: price.currency,
      checkoutRef: checkoutRefOf(optimalAvia), mode: "avia",
    });
    if (built) packages.push(built);
  }

  const fasterAvia = fastest(aviaRoundTrips, optimalAvia);
  if (fasterAvia && packages.length < 2) {
    const price = firstPrice(fasterAvia);
    const built = makePackage({
      inputs, role: "faster_or_comfortable", now, hotel, exact: true,
      outbound: fasterAvia, returning: fasterAvia,
      transportAmount: price.amount, transportCurrency: price.currency,
      checkoutRef: checkoutRefOf(fasterAvia), mode: "avia",
    });
    if (built) packages.push(built);
  }

  if (packages.length >= 2) return packages;

  const outbound = outbounds[packages.length] ?? outbounds[0];
  const returning = returns[packages.length] ?? returns[0];
  if (outbound || returning) {
    const split = splitAmount(outbound, returning);
    const built = makePackage({
      inputs,
      role: packages.length === 0 ? "optimal" : "faster_or_comfortable",
      now, hotel, exact: false,
      outbound, returning,
      transportAmount: split.amount, transportCurrency: split.currency,
      checkoutRef: checkoutRefOf(outbound),
      returnCheckoutRef: checkoutRefOf(returning),
      mode: getMode(outbound ?? returning ?? {}),
    });
    if (built) packages.push(built);
  }

  if (packages.length === 0 && hotel) {
    const built = makePackage({
      inputs, role: "optimal", now, hotel, exact: false, mode: "transport",
    });
    if (built) packages.push(built);
  }

  return packages;
}

function sourceEvidence(tool: SourceEvidence["tool"], status: SourceEvidence["status"], receivedAt: string, variants: number): SourceEvidence {
  return { tool, status, receivedAt, variants };
}

function outcomeOf(settled: PromiseSettledResult<PackageCallResult> | undefined): SearchOutcome {
  if (!settled) return {};
  return settled.status === "fulfilled" ? { result: settled.value } : { error: settled.reason };
}

export async function buildPackagesResponse(request: PackagesRequest, options: PackageOptions = {}): Promise<PackagesResponse> {
  const parsed = PackagesRequestSchema.safeParse(request);
  const requestId = options.requestId ?? "packages-request";
  if (!parsed.success) {
    return { packages: [], warnings: [errorWarning("validation", "INVALID_REQUEST", "Invalid packages request.", false)], sources: [], requestId };
  }
  const inputs = getSearchInputs(parsed.data);
  if ("error" in inputs) {
    return { packages: [], warnings: [errorWarning("validation", "INVALID_REQUEST", inputs.error, false)], sources: [], requestId };
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const callTool = options.callTool;
  if (!callTool) throw new Error("Package MCP adapter is not configured");

  const planned = planCalls(inputs);
  let settled: PromiseSettledResult<PackageCallResult>[];
  try {
    settled = await withTimeout(
      Promise.allSettled(planned.map((call) => callTool(call.tool, call.args, MCP_DURATION_BUDGETS.mcpCallMs))),
      MCP_DURATION_BUDGETS.routeMs,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP route failed";
    return {
      packages: [],
      warnings: [errorWarning("mcp", "MCP_ROUTE_TIMEOUT", message, true)],
      sources: planned.map((call) => sourceEvidence(call.tool, "unavailable", now, 0)),
      requestId,
    };
  }

  const byKey = new Map<PlannedCall["key"], SearchOutcome>();
  planned.forEach((call, index) => byKey.set(call.key, outcomeOf(settled[index])));

  const aviaOutcome = byKey.get("avia") ?? {};
  const outboundOutcome = byKey.get("outbound") ?? {};
  const returnOutcome = byKey.get("return") ?? {};
  const hotelOutcome = byKey.get("hotel") ?? {};
  const aviaPayload = aviaOutcome.result ? extractPayload(aviaOutcome.result) : undefined;
  const outboundPayload = outboundOutcome.result ? extractPayload(outboundOutcome.result) : undefined;
  const returnPayload = returnOutcome.result ? extractPayload(returnOutcome.result) : undefined;
  const hotelPayload = hotelOutcome.result ? extractPayload(hotelOutcome.result) : undefined;

  const warnings: SourceWarning[] = [];
  if (byKey.has("avia") && (aviaOutcome.error || !aviaPayload || aviaOutcome.result?.isError)) {
    warnings.push(errorWarning("transport", "AVIA_UNAVAILABLE", "Tutu round-trip flight search is unavailable.", true));
  }
  if (byKey.has("outbound") && (outboundOutcome.error || !outboundPayload || outboundOutcome.result?.isError)) {
    warnings.push(errorWarning("transport", "OUTBOUND_UNAVAILABLE", "Tutu outbound transport search is unavailable.", true));
  }
  if (byKey.has("return") && (returnOutcome.error || !returnPayload || returnOutcome.result?.isError)) {
    warnings.push(errorWarning("transport", "RETURN_UNAVAILABLE", "Tutu return transport search is unavailable.", true));
  }
  if (hotelOutcome.error || !hotelPayload || hotelOutcome.result?.isError) {
    warnings.push(errorWarning("hotel", "HOTEL_UNAVAILABLE", "Tutu hotel search is unavailable.", true));
  }
  for (const payload of [outboundPayload, returnPayload, aviaPayload]) {
    const meta = payload ? readObject(payload, "meta") : undefined;
    if (meta && readArray(meta, "unavailable").length > 0) {
      warnings.push(errorWarning("transport", "TRANSPORT_PARTIAL", "Some transport modes are unavailable.", true));
    }
  }

  const packages = rankPackages(
    buildPackages(inputs, { avia: aviaPayload, outbound: outboundPayload, returning: returnPayload, hotel: hotelPayload }, now),
    parsed.data.preferences,
    parsed.data.sessionSeed,
  );
  if (packages.length === 0 && warnings.length === 0) warnings.push(errorWarning("mcp", "NO_LIVE_OFFERS", "Tutu returned no usable offers.", false));

  const sources: SourceEvidence[] = [];
  for (const call of planned) {
    const payload = call.key === "avia" ? aviaPayload
      : call.key === "outbound" ? outboundPayload
        : call.key === "return" ? returnPayload
          : hotelPayload;
    const variants = payload
      ? (call.tool === "search_hotels" ? getHotels(payload).length : getTransportVariants(payload).length)
      : 0;
    const meta = payload ? readObject(payload, "meta") : undefined;
    const status: SourceEvidence["status"] = !payload
      ? "unavailable"
      : meta && readArray(meta, "unavailable").length > 0
        ? "partial"
        : "ok";
    sources.push(sourceEvidence(call.tool, status, now, variants));
  }

  const summary = preferenceSummary(parsed.data.preferences);
  return { packages, warnings, sources, requestId, ...(summary ? { preferenceSummary: summary } : {}) };
}
