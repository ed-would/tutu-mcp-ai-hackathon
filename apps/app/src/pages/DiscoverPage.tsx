import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { preferenceSummary } from "../../shared/prefs";
import { IdeaDeck } from "../components/discover/IdeaDeck";
import { ClarifyForm } from "../components/discover/ClarifyForm";
import { RouteThread } from "../components/RouteThread";
import { assignPackageSqSlots } from "../lib/packageArt";
import {
  MAX_LIKED_DIRECTIONS,
  checkoutRefsOf,
  formatRub,
  transportLabel,
  getCheckout,
  getPackages,
  interpretTrip,
  newSeed,
  nextPreference,
  rankLivePackages,
  topSignals,
  type CheckoutResult,
  type Clarification,
  type DestinationIdea,
  type PackageOption,
  type PreferenceVector,
  type TravelIntent,
} from "../lib/travel";

type Phase = "intent" | "clarify" | "deck" | "reveal" | "loading" | "packages" | "error";
type Session = {
  phase: Phase;
  seed: string;
  prompt: string;
  answers: Record<string, string>;
  questions: Clarification[];
  draftIntent?: Partial<TravelIntent>;
  intent?: TravelIntent;
  ideas: DestinationIdea[];
  index: number;
  likes: DestinationIdea[];
  preferences: PreferenceVector;
  packages: PackageOption[];
  preferenceSummary?: string;
  warning?: string;
  error?: string;
};
const storageKey = "tutu-kuda-session-v2";
const quickPrompts = ["Хочу на несколько дней к морю — без спешки", "Нужен городской уикенд с хорошей едой", "Хочу тихо перезагрузиться на природе"];
const empty = (): Session => ({ phase: "intent", seed: newSeed(), prompt: "", answers: {}, questions: [], ideas: [], index: 0, likes: [], preferences: {}, packages: [] });
function restore(): Session { try { const saved = localStorage.getItem(storageKey); return saved ? { ...empty(), ...JSON.parse(saved) } : empty(); } catch { return empty(); } }

export function DiscoverPage() {
  const [session, setSession] = useState<Session>(restore);
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(session)); }, [session]);
  const current = session.ideas[session.index];
  const signals = useMemo(() => topSignals(session.preferences), [session.preferences]);
  const learned = useMemo(
    () => session.preferenceSummary ?? preferenceSummary(session.preferences),
    [session.preferenceSummary, session.preferences],
  );

  async function begin(event?: FormEvent, answersOverride?: Record<string, string>) {
    event?.preventDefault();
    if (!session.prompt.trim()) return;
    const answers = answersOverride ?? session.answers;
    setBusy(true);
    try {
      const result = await interpretTrip(session.prompt, answers);
      if (result.status === "needs_clarification") {
        setSession((s) => ({
          ...s,
          phase: "clarify",
          answers,
          questions: result.questions,
          draftIntent: result.draftIntent,
          error: answersOverride
            ? "Проверьте поля формы — не хватает данных для подбора направлений."
            : undefined,
        }));
        return;
      }
      setSession((s) => ({
        ...s,
        phase: "deck",
        answers,
        intent: result.intent,
        ideas: result.ideas,
        index: 0,
        likes: [],
        preferences: {},
        preferenceSummary: undefined,
        questions: [],
        draftIntent: undefined,
        error: undefined,
      }));
    } catch (error) {
      setSession((s) => ({
        ...s,
        phase: s.phase === "clarify" ? "clarify" : "error",
        error: messageOf(error),
      }));
    } finally {
      setBusy(false);
    }
  }
  function decide(liked: boolean) {
    if (!current) return;
    setSession((s) => {
      const index = s.index + 1;
      const likes = liked ? [...s.likes, current] : s.likes;
      return { ...s, index, likes, preferences: nextPreference(s.preferences, current, liked), phase: index >= s.ideas.length ? "reveal" : "deck" };
    });
  }
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (session.phase !== "deck" || busy || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); decide(false); }
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") { event.preventDefault(); decide(true); }
    }
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  async function buildPackages() {
    if (!session.intent || !session.likes.length) return;
    setSession((s) => ({ ...s, phase: "loading", error: undefined }));
    try {
      const liked = session.likes.slice(0, MAX_LIKED_DIRECTIONS);
      const results = await Promise.allSettled(liked.map((idea) => getPackages(idea, session.intent!, session.seed, session.preferences)));
      const packages = rankLivePackages(
        results.flatMap((result) => result.status === "fulfilled" ? result.value.packages : []),
        session.preferences,
        session.seed,
      );
      const summary = results.find((result) => result.status === "fulfilled")?.value.preferenceSummary
        ?? preferenceSummary(session.preferences);
      if (!packages.length) throw new Error("Не удалось собрать живые варианты. Попробуйте через минуту или выберите другое направление.");
      setSession((s) => ({
        ...s,
        phase: "packages",
        packages,
        preferenceSummary: summary,
        warning: results.some((result) => result.status === "rejected") ? "Часть вариантов не успела загрузиться. Показываем то, что удалось найти." : undefined,
      }));
    } catch (error) { setSession((s) => ({ ...s, phase: "reveal", error: messageOf(error) })); }
  }
  async function openCheckout(refs: Record<string, unknown>[]) {
    if (!refs.length) return;
    setBusy(true);
    setCheckout(null);
    try { setCheckout(await getCheckout(refs)); } catch (error) { setSession((s) => ({ ...s, warning: messageOf(error) })); } finally { setBusy(false); }
  }
  function reset() { setCheckout(null); setSession(empty()); }
  if (session.phase === "deck" && current) return <IdeaDeck idea={current} index={session.index} onPass={() => decide(false)} onLike={() => decide(true)} />;
  if (session.phase === "reveal" || session.phase === "loading") {
    return <Reveal session={session} signals={signals} learned={learned} loading={session.phase === "loading"} onBuild={buildPackages} onReset={reset} />;
  }
  if (session.phase === "packages") {
    return (
      <PackageResults
        packages={session.packages}
        learned={learned}
        warning={session.warning}
        checkout={checkout}
        busy={busy}
        onCheckout={openCheckout}
        onReset={reset}
      />
    );
  }
  if (session.phase === "clarify") {
    return (
      <ClarifyStep
        session={session}
        busy={busy}
        onSubmit={(answers) => { void begin(undefined, answers); }}
        onReset={reset}
      />
    );
  }
  return <Intent session={session} busy={busy} setSession={setSession} onSubmit={begin} onReset={reset} />;
}

function Intent({ session, busy, setSession, onSubmit, onReset }: { session: Session; busy: boolean; setSession: Dispatch<SetStateAction<Session>>; onSubmit: (event?: FormEvent) => void; onReset: () => void }) {
  const isError = session.phase === "error";
  return (
    <section className="discover-shell" aria-labelledby="discover-title">
      <div className="discover-intro">
        <h1 id="discover-title">Куда вам хочется <em>на самом деле?</em></h1>
        <p className="lede">Начните с ощущения, места или свободных дней. Мы бережно сузим выбор до поездок, которые можно сравнить.</p>
        <RouteThread />
      </div>
      <form className="intent-card" onSubmit={onSubmit}>
        <label htmlFor="trip-intent">Что вы хотите получить от этой поездки?</label>
        <textarea
          id="trip-intent"
          rows={4}
          value={session.prompt}
          onChange={(event) => setSession((s) => ({ ...s, prompt: event.target.value, phase: "intent", error: undefined }))}
          placeholder="Например: хочу на несколько дней к морю, хорошую еду и никаких ранних подъёмов"
        />
        <div className="quick-prompts">{quickPrompts.map((prompt) => <button className="chip" type="button" key={prompt} onClick={() => setSession((s) => ({ ...s, prompt }))}>{prompt}</button>)}</div>
        <button className="button button-primary button-wide" type="submit" disabled={busy || !session.prompt.trim()}>
          {busy ? "Собираем направления…" : "Показать возможности"} <span aria-hidden="true">→</span>
        </button>
        {isError && (
          <div className="inline-error" role="alert">
            <strong>Пока не получилось.</strong>
            <span>{session.error}</span>
            <button type="button" className="text-link" onClick={() => onSubmit()}>Попробовать ещё раз</button>
          </div>
        )}
      </form>
      <p className="quiet-note">Не знаете, с чего начать? <Link to="/guide">Читайте двухминутный гид</Link>.</p>
      {isError && <button className="reset-link" type="button" onClick={onReset}>Начать заново</button>}
    </section>
  );
}

function ClarifyStep({ session, busy, onSubmit, onReset }: { session: Session; busy: boolean; onSubmit: (answers: Record<string, string>) => void; onReset: () => void }) {
  return (
    <section className="discover-shell" aria-labelledby="clarify-title">
      <div className="clarify-panel">
        <p className="eyebrow">уточним маршрут</p>
        <h1 id="clarify-title">Пара коротких ориентиров</h1>
        <p className="lede">Как в обычном поиске билетов: город, даты, пассажиры и бюджет — один раз, без повторов.</p>
        <ClarifyForm
          answers={session.answers}
          draftIntent={session.draftIntent}
          busy={busy}
          error={session.error}
          onSubmit={onSubmit}
        />
      </div>
      <button className="reset-link" type="button" onClick={onReset}>Начать заново</button>
    </section>
  );
}

function Reveal({ session, signals, learned, loading, onBuild, onReset }: { session: Session; signals: string[]; learned: string | undefined; loading: boolean; onBuild: () => void; onReset: () => void }) {
  const canBuild = session.likes.length > 0;
  return (
    <section className="discover-shell reveal-shell" aria-labelledby="reveal-title">
      <div className="reveal-mark">0{session.likes.length}</div>
      <h1 id="reveal-title">Вам важны не просто города. Вам важен <em>ритм.</em></h1>
      <RouteThread />
      <div className="signal-panel">
        <p>Ваши сигналы</p>
        <div className="signal-list">{(signals.length ? signals : ["новые впечатления", "свой темп"]).map((signal) => <span key={signal}>{signal}</span>)}</div>
        {learned && <p className="preference-summary">{learned}</p>}
        <p className="muted">Вы отметили {session.likes.length} из 8 направлений. Для живого расчёта берём максимум {MAX_LIKED_DIRECTIONS} самых близких варианта.</p>
      </div>
      {session.error && <div className="inline-error" role="alert">{session.error}</div>}
      {loading ? <LoadingRoute /> : (
        <>
          <button className="button button-primary button-wide" type="button" onClick={onBuild} disabled={!canBuild}>
            {canBuild ? "Собрать живые варианты" : "Нужно отметить хотя бы один вариант"} <span aria-hidden="true">→</span>
          </button>
          <button className="reset-link" type="button" onClick={onReset}>Пройти маршрут заново</button>
        </>
      )}
    </section>
  );
}

function LoadingRoute() {
  return (
    <div className="loading-route" role="status">
      <RouteThread label="Собираем поездку" />
      <p>Смотрим дорогу и проживание в Туту</p>
      <span>Сначала ищем самые понятные сочетания — без придуманных цен.</span>
    </div>
  );
}

function PackageResults({ packages, learned, warning, checkout, busy, onCheckout, onReset }: {
  packages: PackageOption[];
  learned?: string;
  warning?: string;
  checkout: CheckoutResult | null;
  busy: boolean;
  onCheckout: (refs: Record<string, unknown>[]) => void;
  onReset: () => void;
}) {
  const steps = checkout?.steps?.length ? checkout.steps : checkout ? [{ order: 1, label: "Перейти к бронированию", url: checkout.url }] : [];
  const sqSlots = assignPackageSqSlots(packages.map((item) => item.id));
  return (
    <section className="discover-shell packages-shell" aria-labelledby="packages-title">
      <div className="discover-intro">
        <h1 id="packages-title">Вот что можно <em>собрать прямо сейчас.</em></h1>
        <p className="lede">Цены и наличие пришли из Туту. Поездка будет состоять из отдельных бронирований, поэтому итог отмечен как ориентир.</p>
        {learned && <p className="preference-summary">{learned}</p>}
        <RouteThread />
      </div>
      {warning && <div className="warning" role="status">{warning}</div>}
      <div className="package-list">
        {packages.map((item, index) => (
          <PackageCard
            key={item.id}
            item={item}
            sqSlot={sqSlots[index] ?? 1}
            busy={busy}
            onCheckout={onCheckout}
          />
        ))}
      </div>
      {checkout && (
        <div className="checkout-ready" role="status">
          <p className="eyebrow">ссылки готовы</p>
          <strong>Продолжим на Туту</strong>
          {checkout.note && <span>{checkout.note}</span>}
          <p className="muted">Оплата только на сайте Туту — здесь мы лишь собираем шаги бронирования.</p>
          <div className="checkout-steps">
            {steps.map((step) => (
              <a className="button button-primary" key={`${step.order}-${step.url}`} href={step.url} target="_blank" rel="noreferrer">
                {step.order}. {step.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <button className="reset-link" type="button" onClick={onReset}>Начать новый маршрут</button>
    </section>
  );
}

function packageBadgeLabel(item: PackageOption): string {
  if (item.role === "optimal") return "Оптимальный вариант";
  if (item.role === "faster_or_comfortable") return "Быстрее или комфортнее";
  const hasTransport = Boolean(item.transport?.mode || item.transport?.title);
  const hasHotel = Boolean(item.hotel);
  if (hasTransport && hasHotel) return "Дорога и проживание";
  if (hasHotel) return "С проживанием";
  if (hasTransport) return "Только дорога";
  return "Собранный маршрут";
}

function PackageCard({
  item,
  sqSlot,
  busy,
  onCheckout,
}: {
  item: PackageOption;
  sqSlot: number;
  busy: boolean;
  onCheckout: (refs: Record<string, unknown>[]) => void;
}) {
  const transport = item.transport;
  const hotel = item.hotel;
  const refs = checkoutRefsOf(item);
  const priceKind = item.price?.confidence === "exact_round_trip" ? "точная цена" : "ориентировочная цена";
  return (
    <article className="package-card has-sq-bg" data-sq={String(sqSlot)}>
      <div className="package-card-head">
        <span className="live-badge">{packageBadgeLabel(item)}</span>
        <span className="price-kind">{priceKind}</span>
      </div>
      <h2>{item.title ?? item.destination ?? "Маршрут в Туту"}</h2>
      <div className="package-price">
        {formatRub(item.price?.amount, item.price?.currency)}
        <small>{item.price?.confidence === "estimated_split_trip" ? "за дорогу и проживание вместе" : "актуальная стоимость"}</small>
      </div>
      <RouteThread label="Состав поездки" tone="saved" />
      <div className="package-parts">
        <div>
          <span>дорога</span>
          <strong>{transportLabel(transport)}</strong>
          <p>{transport?.summary ?? "Детали откроются на стороне Туту."}</p>
        </div>
        {hotel && (
          <div>
            <span>проживание</span>
            <strong>{hotel.name ?? hotel.title ?? "Отель"}</strong>
            <p>{hotel.summary ?? "Подберём вариант под ваш маршрут."}</p>
          </div>
        )}
      </div>
      {refs.length > 0 && (
        <button className="button button-secondary button-wide" type="button" disabled={busy} onClick={() => onCheckout(refs)}>
          {busy ? "Готовим ссылку…" : "Перейти к бронированию"} <span aria-hidden="true">↗</span>
        </button>
      )}
    </article>
  );
}

function messageOf(error: unknown) { return error instanceof Error ? error.message : "Что-то пошло не так. Попробуйте ещё раз."; }
