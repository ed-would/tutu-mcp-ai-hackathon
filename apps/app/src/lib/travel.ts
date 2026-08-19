import { MAX_LIKED_DIRECTIONS, nextPreference as applyPreference, rankPackages, topSignals as preferenceSignals, type PreferenceVector } from "../../shared/prefs";

export type DestinationIdea = {
  id: string;
  destination: string;
  title: string;
  summary: string;
  tags: string[];
  vibe: string;
};

export type TravelIntent = {
  origin: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  childrenAges: number[];
  budgetRub?: number;
};

export type Clarification = { id: string; prompt: string; options?: string[] };
export type InterpretResult =
  | { status: "needs_clarification"; questions: Clarification[]; draftIntent?: Partial<TravelIntent> }
  | { status: "ready"; intent: TravelIntent; ideas: DestinationIdea[]; generation?: string };

export type PackageOption = {
  id: string;
  ideaId?: string;
  destination?: string;
  title?: string;
  role?: "optimal" | "faster_or_comfortable" | string;
  price?: { amount?: number; currency?: string; confidence?: "exact_round_trip" | "estimated_split_trip" | string };
  transport?: { title?: string; mode?: string; summary?: string; checkoutRef?: Record<string, unknown>; returnCheckoutRef?: Record<string, unknown> };
  hotel?: { title?: string; name?: string; summary?: string; checkoutRef?: Record<string, unknown> };
  checkoutRef?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ApiIssue = { message?: string; code?: string; retryable?: boolean; stage?: string };
export type PackagesResult = { packages: PackageOption[]; warnings?: ApiIssue[]; preferenceSummary?: string };
export type CheckoutStep = { order: number; label: string; url: string; product: string; note?: string };
export type CheckoutResult = { url: string; kind: string; fallbackUrl?: string; note?: string; steps?: CheckoutStep[] };

export { MAX_LIKED_DIRECTIONS };
export type { PreferenceVector };

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as T & ApiIssue;
  if (!response.ok) {
    throw new Error(data.message ?? "Сервис временно недоступен. Попробуйте ещё раз.");
  }
  return data;
}

export function interpretTrip(prompt: string, answers: Record<string, string> = {}) {
  return post<InterpretResult>("/api/interpret", { prompt, answers, locale: "ru-RU" });
}

export function getPackages(
  idea: DestinationIdea,
  intent: TravelIntent,
  sessionSeed: string,
  preferences: PreferenceVector = {},
) {
  const adults = Math.min(6, Math.max(1, intent.adults));
  const childrenAges = intent.childrenAges.filter((age) => Number.isInteger(age) && age >= 0 && age <= 17);
  return post<PackagesResult>("/api/packages", {
    intent: { ...intent, adults, childrenAges },
    idea,
    preferences,
    sessionSeed,
  });
}

export function checkoutRefsOf(item: PackageOption): Record<string, unknown>[] {
  const refs: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  const push = (value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    const key = JSON.stringify(value);
    if (seen.has(key)) return;
    seen.add(key);
    refs.push(value as Record<string, unknown>);
  };
  push(item.transport?.checkoutRef);
  push(item.transport?.returnCheckoutRef);
  push(item.hotel?.checkoutRef);
  push(item.checkoutRef);
  return refs;
}

export function getCheckout(refs: Record<string, unknown>[]) {
  return post<CheckoutResult>("/api/checkout", { refs });
}

export function formatRub(amount?: number, currency = "RUB") {
  if (!amount) return "Цена уточняется";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

const TRANSPORT_MODE_LABELS: Record<string, string> = {
  avia: "АВИА",
  rail: "ПОЕЗД",
  bus: "АВТОБУС",
  etrain: "ЭЛЕКТРИЧКА",
  multitransport: "КОМБО",
  transport: "ТРАНСПОРТ",
};

export function transportModeLabel(mode?: string): string | undefined {
  if (!mode) return undefined;
  const mapped = TRANSPORT_MODE_LABELS[mode.toLowerCase()];
  if (mapped) return mapped;
  return mode.toLocaleUpperCase("ru-RU");
}

export function transportLabel(transport?: { mode?: string; title?: string }): string {
  const fromMode = transportModeLabel(transport?.mode);
  if (fromMode) return fromMode;
  if (transport?.title) return transport.title;
  return "Вариант транспорта";
}

export function newSeed() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

export function nextPreference(vector: PreferenceVector, idea: DestinationIdea, liked: boolean): PreferenceVector {
  return applyPreference(vector, idea.tags, liked);
}

export function topSignals(vector: PreferenceVector) {
  return preferenceSignals(vector);
}

export function rankLivePackages(packages: PackageOption[], preferences: PreferenceVector, sessionSeed: string): PackageOption[] {
  const rankable = packages.filter((item): item is PackageOption & { transport: { mode: string }; price: { amount: number } } => (
    typeof item.transport?.mode === "string"
    && item.transport.mode.length > 0
    && typeof item.price?.amount === "number"
  ));
  if (rankable.length !== packages.length) return packages;
  return rankPackages(rankable, preferences, sessionSeed);
}
