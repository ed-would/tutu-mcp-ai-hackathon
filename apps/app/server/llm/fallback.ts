import { partyFromAnswers } from "../../shared/party";
import {
  type ClarificationQuestion,
  type DestinationIdea,
  type GeneratedClarification,
  type GeneratedReady,
  type InterpretRequest,
  type TravelIntent,
} from "./contracts";

const KNOWN_CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск", "Сочи", "Минеральные Воды", "Владивосток",
];

const DESTINATIONS = [
  { destination: "Санкт-Петербург", country: "Россия", title: "Белые ночи и длинные прогулки", summary: "Музеи, вода и ритм большого города, в котором легко идти своим темпом.", tags: ["культура", "еда", "прогулки"] },
  { destination: "Казань", country: "Россия", title: "Город двух культур", summary: "Насыщенная кухня, набережная и короткие расстояния между впечатлениями.", tags: ["еда", "история", "город"] },
  { destination: "Сочи", country: "Россия", title: "Море с горным воздухом", summary: "Тёплый юг, набережная и возможность чередовать море с природой.", tags: ["море", "природа", "тепло"] },
  { destination: "Калининград", country: "Россия", title: "Европейское настроение у моря", summary: "Неспешные улицы, побережье и гастрономический маршрут на несколько дней.", tags: ["море", "еда", "архитектура"] },
  { destination: "Мурманск", country: "Россия", title: "Северный свет и простор", summary: "Большой северный пейзаж для тех, кому хочется сменить масштаб и ритм.", tags: ["природа", "приключения", "север"] },
  { destination: "Петрозаводск", country: "Россия", title: "Тихая вода и лес", summary: "Спокойный побег к озеру, природе и длинным разговорам без спешки.", tags: ["природа", "тихо", "вода"] },
  { destination: "Владивосток", country: "Россия", title: "Город на краю карты", summary: "Морские виды, необычная кухня и ощущение настоящего путешествия.", tags: ["море", "еда", "приключения"] },
  { destination: "Нижний Новгород", country: "Россия", title: "Волга и старый город", summary: "Удобный городской уикенд с видами, прогулками и живой локальной сценой.", tags: ["город", "история", "прогулки"] },
  { destination: "Алтай", country: "Россия", title: "Перезагрузка в горах", summary: "Природный маршрут для смены темпа, тишины и свежего воздуха.", tags: ["горы", "природа", "тихо"] },
  { destination: "Дагестан", country: "Россия", title: "Каньоны, море и гостеприимство", summary: "Контрастный маршрут с сильными пейзажами и выразительной кухней.", tags: ["горы", "море", "еда"] },
  { destination: "Ярославль", country: "Россия", title: "Медленный маршрут по Золотому кольцу", summary: "История, набережная и формат поездки, который не требует долгой подготовки.", tags: ["история", "тихо", "город"] },
  { destination: "Кисловодск", country: "Россия", title: "Парки, воздух и восстановление", summary: "Курортный ритм, прогулки и пространство для спокойного отдыха.", tags: ["природа", "тихо", "восстановление"] },
];

function inputText(request: InterpretRequest): string {
  const answers = Object.values(request.answers ?? {}).flatMap((value) => value).join(" ");
  return `${request.prompt} ${answers}`.trim();
}

function answer(request: InterpretRequest, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = request.answers?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value) && value.length) return value.join(", ").trim();
  }
  return undefined;
}

function extractOrigin(request: InterpretRequest): string | undefined {
  const explicit = answer(request, "origin", "from", "originCity", "город");
  if (explicit) return explicit;
  const text = inputText(request);
  const known = KNOWN_CITIES.find((city) => text.toLocaleLowerCase().includes(city.toLocaleLowerCase()));
  if (known) return known;
  const match = text.match(/(?:из|from)\s+([А-ЯЁA-Z][А-ЯЁа-яёA-Za-z-]{2,}(?:\s+[А-ЯЁA-Z][А-ЯЁа-яёA-Za-z-]{2,})?)/i);
  const value = match?.[1]?.trim();
  if (value?.toLocaleLowerCase() === "москвы") return "Москва";
  if (value?.toLocaleLowerCase() === "петербурга") return "Санкт-Петербург";
  return value;
}

function extractDates(request: InterpretRequest): [string?, string?] {
  const combined = answer(request, "dates");
  const departure = answer(request, "departureDate", "dateFrom", "startDate");
  const returning = answer(request, "returnDate", "dateTo", "endDate");
  if (departure && returning) return [normalizeDate(departure), normalizeDate(returning)];
  if (combined) {
    const dates = [...combined.matchAll(/\b(20\d{2}-\d{2}-\d{2}|\d{2}\.\d{2}\.20\d{2})\b/g)].map((match) => match[1]);
    if (dates[0] && dates[1]) return [normalizeDate(dates[0]), normalizeDate(dates[1])];
  }
  const text = inputText(request);
  const dates = [...text.matchAll(/\b(20\d{2}-\d{2}-\d{2}|\d{2}\.\d{2}\.20\d{2})\b/g)].map((match) => match[1]);
  return [normalizeDate(departure ?? dates[0]), normalizeDate(returning ?? dates[1])];
}

function normalizeDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{2})\.(\d{2})\.(20\d{2})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function extractBudget(request: InterpretRequest): number | undefined {
  const explicit = answer(request, "budget", "budgetRub");
  if (explicit) {
    const digits = explicit.replace(/\s/g, "").match(/^(\d{3,})$/);
    if (digits) return Number(digits[1]);
  }
  const text = explicit ?? inputText(request);
  const match = text.match(/(?:до|бюджет(?:ом)?|budget)\s*(\d[\d\s]{2,})\s*(?:₽|руб|рублей|rur|rub)?/i)
    ?? text.match(/(\d[\d\s]{3,})\s*(?:₽|руб|рублей|rur|rub)/i);
  const value = match?.[1]?.replace(/\s/g, "");
  return value ? Number(value) : undefined;
}

function extractParty(request: InterpretRequest): { adults?: number; childrenAges: number[] } {
  const fromAnswers = partyFromAnswers(request.answers);
  if (fromAnswers.adults) return fromAnswers;
  const text = inputText(request);
  if (/вдво[её]м|нас двое|мы двое|двое\s+взросл|for two/i.test(text)) {
    return { adults: 2, childrenAges: fromAnswers.childrenAges };
  }
  if (/один\s+взросл|одна\s+взросл|еду один|еду одна|solo|alone/i.test(text)) {
    return { adults: 1, childrenAges: fromAnswers.childrenAges };
  }
  return { childrenAges: fromAnswers.childrenAges };
}

function missingQuestions(origin: string | undefined, dates: [string?, string?], party: { adults?: number }, budget: number | undefined): ClarificationQuestion[] {
  const questions: ClarificationQuestion[] = [];
  if (!origin) questions.push({ id: "origin", prompt: "Из какого города выезжаете?" });
  if (!dates[0] || !dates[1]) questions.push({ id: "dates", prompt: "Какие точные даты поездки: выезд и возвращение?" });
  if (!party.adults) questions.push({ id: "party", prompt: "Кто едет с вами?" });
  if (!budget) questions.push({ id: "budget", prompt: "Какой общий бюджет поездки в рублях?" });
  return questions.slice(0, 3);
}

function hash(value: string): number {
  let result = 0;
  for (const character of value) result = (result * 31 + character.charCodeAt(0)) >>> 0;
  return result;
}

function buildIdeas(request: InterpretRequest, intent: TravelIntent): DestinationIdea[] {
  const text = inputText(request).toLocaleLowerCase();
  const ranked = [...DESTINATIONS].sort((a, b) => {
    const score = (item: typeof DESTINATIONS[number]) => item.tags.reduce((total, tag) => total + (text.includes(tag) ? 4 : 0), 0);
    return score(b) - score(a);
  });
  const offset = hash(text) % ranked.length;
  const rotated = ranked.slice(offset).concat(ranked.slice(0, offset));
  return rotated.slice(0, 8).map((item, index) => ({
    id: `idea-${hash(`${text}-${item.destination}` ).toString(36)}`,
    destination: item.destination,
    title: index === 0 ? `${item.title} — ваш сильный первый матч` : item.title,
    summary: item.summary,
    tags: item.tags,
    vibe: `${intent.desiredVibe}: ${item.tags.slice(0, 2).join(" и ")}`,
  }));
}

export function fallbackIntent(request: InterpretRequest): GeneratedClarification | GeneratedReady {
  const origin = extractOrigin(request);
  const dates = extractDates(request);
  const budget = extractBudget(request);
  const party = extractParty(request);
  const questions = missingQuestions(origin, dates, party, budget);
  // Debugging is intentionally kept out of production; this comment marks the normalization boundary.
  const draftIntent = {
    ...(origin ? { origin } : {}),
    ...(dates[0] ? { departureDate: dates[0] } : {}),
    ...(dates[1] ? { returnDate: dates[1] } : {}),
    ...(party.adults ? { adults: party.adults } : {}),
    childrenAges: party.childrenAges ?? [],
    ...(budget ? { budgetRub: budget } : {}),
  };
  if (questions.length) return { status: "needs_clarification", questions, draftIntent };

  const text = inputText(request).toLocaleLowerCase();
  const desiredVibe = text.includes("тепл") || text.includes("море") || text.includes("warm") ? "тёплый отдых у воды" : request.prompt.trim();
  const intent: TravelIntent = {
    origin: origin!,
    departureDate: dates[0]!,
    returnDate: dates[1]!,
    adults: party.adults!,
    childrenAges: party.childrenAges ?? [],
    ...(budget ? { budgetRub: budget } : {}),
    pace: text.includes("спокой") || text.includes("тихо") ? "slow" : "balanced",
    interests: DESTINATIONS.flatMap((item) => item.tags.filter((tag) => text.includes(tag))).slice(0, 6),
    desiredVibe,
    allowedTransport: ["avia", "rail", "bus", "multitransport"],
    hotelPreferences: { mode: "choose_self" },
  };
  return { status: "ready", intent, ideas: buildIdeas(request, intent) };
}
