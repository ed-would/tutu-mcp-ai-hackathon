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
  price?: { amount?: number; currency?: string; confidence?: "exact_round_trip" | "estimated_split_trip" | string };
  transport?: { title?: string; mode?: string; summary?: string; checkoutRef?: Record<string, unknown> };
  hotel?: { title?: string; name?: string; summary?: string; checkoutRef?: Record<string, unknown> };
  checkoutRef?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ApiIssue = { message?: string; code?: string; retryable?: boolean; stage?: string };
export type PackagesResult = { packages: PackageOption[]; warnings?: ApiIssue[] };
export type CheckoutResult = { url: string; kind: string; fallbackUrl?: string; note?: string };

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

export function getPackages(idea: DestinationIdea, intent: TravelIntent, sessionSeed: string) {
  if (intent.childrenAges.length > 0) {
    throw new Error("Пакеты с детскими тарифами пока не считаются автоматически. Выберите вариант на Туту отдельно.");
  }
  const adults = Math.min(6, Math.max(1, intent.adults));
  return post<PackagesResult>("/api/packages", {
    intent: { ...intent, adults },
    idea,
    sessionSeed,
  });
}

export function getCheckout(checkoutRef: Record<string, unknown>) {
  return post<CheckoutResult>("/api/checkout", { checkoutRef });
}

export function formatRub(amount?: number, currency = "RUB") {
  if (!amount) return "Цена уточняется";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function newSeed() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

export type PreferenceVector = Record<string, number>;
export function nextPreference(vector: PreferenceVector, idea: DestinationIdea, liked: boolean): PreferenceVector {
  const delta = liked ? 1 : -0.45;
  return idea.tags.reduce<PreferenceVector>((next, tag) => ({ ...next, [tag]: (next[tag] ?? 0) + delta }), vector);
}

export function topSignals(vector: PreferenceVector) {
  return Object.entries(vector).sort(([, a], [, b]) => b - a).filter(([, value]) => value > 0).slice(0, 3).map(([key]) => key);
}
