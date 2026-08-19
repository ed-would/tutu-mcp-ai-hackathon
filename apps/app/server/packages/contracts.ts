import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const PackagesRequestSchema = z.object({
  intent: z.record(z.string(), z.unknown()),
  idea: z.record(z.string(), z.unknown()),
  preferences: z.record(z.string(), z.unknown()).default({}),
  sessionSeed: z.string().min(1).max(128),
});

export type PackagesRequest = z.infer<typeof PackagesRequestSchema>;

export const PackagePriceSchema = z.object({
  confidence: z.enum(["exact_round_trip", "estimated_split_trip"]),
  amount: z.number().finite().nonnegative(),
  currency: z.string().min(1),
  note: z.string().optional(),
});

export type PackagePrice = z.infer<typeof PackagePriceSchema>;

export type SourceWarning = {
  code: string;
  message: string;
  source: "transport" | "hotel" | "validation" | "mcp";
  retryable: boolean;
};

export type SourceEvidence = {
  tool: "search_multitransport" | "search_hotels";
  status: "ok" | "partial" | "unavailable";
  receivedAt: string;
  variants: number;
};

export type TripPackage = {
  id: string;
  title: string;
  destination: string;
  transport: {
    mode: string;
    price?: number;
    currency?: string;
    outbound?: unknown;
    return?: unknown;
    checkoutRef?: unknown;
  };
  hotel?: {
    name: string;
    price?: number;
    currency?: string;
    nights?: number;
    checkoutRef?: unknown;
  };
  price: PackagePrice;
  breakdown: {
    transport?: number;
    hotel?: number;
  };
  source: "Tutu MCP";
  updatedAt: string;
};

export type PackagesResponse = {
  packages: TripPackage[];
  warnings: SourceWarning[];
  sources: SourceEvidence[];
  requestId: string;
};

export type PackageCallResult = {
  isError?: boolean;
  content?: unknown;
  structuredContent?: unknown;
};

export type PackageCallTool = (
  name: "search_multitransport" | "search_hotels",
  args: Record<string, unknown>,
  timeoutMs: number,
) => Promise<PackageCallResult>;

export type PackageOptions = {
  requestId?: string;
  now?: () => Date;
  callTool?: PackageCallTool;
};

export type SearchInputs = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  hotelPreferences: Record<string, unknown>;
};

export function readString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function readNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return undefined;
}

export function readObject(record: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
  }
  return undefined;
}

export function readArray(record: Record<string, unknown>, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function extractPayload(result: PackageCallResult): Record<string, unknown> | undefined {
  if (result.isError) return undefined;
  const structured = result.structuredContent;
  if (typeof structured === "object" && structured !== null && !Array.isArray(structured)) {
    return structured as Record<string, unknown>;
  }

  const content = Array.isArray(result.content) ? result.content : [];
  for (const item of content) {
    if (typeof item !== "object" || item === null) continue;
    const text = (item as Record<string, unknown>).text;
    if (typeof text !== "string") continue;
    const candidates = [text.trim(), text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim()];
    for (const candidate of candidates) {
      try {
        const parsed: unknown = JSON.parse(candidate);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // MCP text can contain human prose; ignore it and continue looking for JSON.
      }
    }
  }
  return undefined;
}

export function normalizeDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const parsed = isoDate.safeParse(value.trim());
  return parsed.success ? parsed.data : undefined;
}

export function getSearchInputs(request: PackagesRequest): SearchInputs | { error: string } {
  const intent = request.intent;
  const idea = request.idea;
  const origin = readString(intent, "origin", "originCity", "from", "fromCity", "departureCity");
  const destination = readString(idea, "city", "destination", "destinationCity", "title", "name") ??
    readString(intent, "destination", "destinationCity", "to", "toCity");
  const departureDate = normalizeDate(intent.departureDate ?? intent.departure_date ?? intent.checkIn ?? intent.check_in);
  const returnDate = normalizeDate(intent.returnDate ?? intent.return_date ?? intent.checkOut ?? intent.check_out);
  const adults = readNumber(intent, "adults", "adultCount", "passengers") ?? 1;
  const children = intent.childrenAges ?? intent.children_ages ?? intent.children;

  if (!origin || !destination || !departureDate || !returnDate) {
    return { error: "Origin, destination, departure date and return date are required." };
  }
  if (departureDate >= returnDate) return { error: "Return date must be after departure date." };
  if (!Number.isInteger(adults) || adults < 1 || adults > 6) return { error: "Adults must be an integer from 1 to 6." };
  if (Array.isArray(children) && children.length > 0) {
    return { error: "Family pricing is deferred: live multitransport search supports adults only." };
  }

  const rawPrefs = readObject(intent, "hotelPreferences", "hotel_preferences") ?? {};
  const prefs: Record<string, unknown> = {};
  const acceptedPreferenceKeys = [
    "breakfast_included", "free_cancellation", "stars", "meals", "price_max",
    "hotel_types", "min_rating", "hotel_amenities", "room_amenities", "view",
  ] as const;
  for (const key of acceptedPreferenceKeys) {
    if (rawPrefs[key] !== undefined) prefs[key] = rawPrefs[key];
  }
  const aliases: Record<string, string> = {
    breakfast: "breakfast_included", breakfastIncluded: "breakfast_included",
    freeCancellation: "free_cancellation", priceMax: "price_max",
    hotelTypes: "hotel_types", minRating: "min_rating",
    hotelAmenities: "hotel_amenities", roomAmenities: "room_amenities",
  };
  for (const [from, to] of Object.entries(aliases)) {
    if (prefs[to] === undefined && rawPrefs[from] !== undefined) prefs[to] = rawPrefs[from];
  }
  return { origin, destination, departureDate, returnDate, adults, hotelPreferences: prefs };
}
