import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { IdeaDeck } from "../components/discover/IdeaDeck";
import { RouteThread } from "../components/RouteThread";
import {
  formatRub, getCheckout, getPackages, interpretTrip, newSeed, nextPreference, topSignals,
  type CheckoutResult, type Clarification, type DestinationIdea, type PackageOption,
  type PreferenceVector, type TravelIntent,
} from "../lib/travel";

type Phase = "intent" | "clarify" | "deck" | "reveal" | "loading" | "packages" | "error";
type Session = { phase: Phase; seed: string; prompt: string; answers: Record<string, string>; questions: Clarification[]; intent?: TravelIntent; ideas: DestinationIdea[]; index: number; likes: DestinationIdea[]; preferences: PreferenceVector; packages: PackageOption[]; warning?: string; error?: string };
const storageKey = "tutu-kuda-session-v1";
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

  async function begin(event?: FormEvent) {
    event?.preventDefault(); if (!session.prompt.trim()) return; setBusy(true);
    try {
      const result = await interpretTrip(session.prompt, session.answers);
      if (result.status === "needs_clarification") setSession((s) => ({ ...s, phase: "clarify", questions: result.questions }));
      else setSession((s) => ({ ...s, phase: "deck", intent: result.intent, ideas: result.ideas, index: 0, likes: [], preferences: {} }));
    } catch (error) { setSession((s) => ({ ...s, phase: "error", error: messageOf(error) })); } finally { setBusy(false); }
  }
  function decide(liked: boolean) {
    if (!current) return;
    setSession((s) => { const index = s.index + 1; const likes = liked ? [...s.likes, current] : s.likes; return { ...s, index, likes, preferences: nextPreference(s.preferences, current, liked), phase: index >= s.ideas.length ? "reveal" : "deck" }; });
  }
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (session.phase !== "deck" || busy || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); decide(false); }
      if (event.key === "ArrowRight" || event.key === "Enter") { event.preventDefault(); decide(true); }
    }
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  async function buildPackages() {
    if (!session.intent || !session.likes.length) return; setSession((s) => ({ ...s, phase: "loading", error: undefined }));
    try {
      const results = await Promise.allSettled(session.likes.slice(0, 2).map((idea) => getPackages(idea, session.intent!, session.seed)));
      const packages = results.flatMap((result) => result.status === "fulfilled" ? result.value.packages : []);
      if (!packages.length) throw new Error("Не удалось собрать живые варианты. Попробуйте через минуту или выберите другое направление.");
      setSession((s) => ({ ...s, phase: "packages", packages, warning: results.some((result) => result.status === "rejected") ? "Часть вариантов не успела загрузиться. Показываем то, что удалось найти." : undefined }));
    } catch (error) { setSession((s) => ({ ...s, phase: "reveal", error: messageOf(error) })); }
  }
  async function openCheckout(ref: unknown) {
    if (!ref || typeof ref !== "object" || Array.isArray(ref)) return; setBusy(true); setCheckout(null);
    try { setCheckout(await getCheckout(ref as Record<string, unknown>)); } catch (error) { setSession((s) => ({ ...s, warning: messageOf(error) })); } finally { setBusy(false); }
  }
  function reset() { setCheckout(null); setSession(empty()); }
  if (session.phase === "deck" && current) return <IdeaDeck idea={current} index={session.index} onPass={() => decide(false)} onLike={() => decide(true)} />;
  if (session.phase === "clarify") return <Clarify session={session} busy={busy} setSession={setSession} onSubmit={begin} />;
  if (session.phase === "reveal" || session.phase === "loading") return <Reveal session={session} signals={signals} loading={session.phase === "loading"} onBuild={buildPackages} onReset={reset} />;
  if (session.phase === "packages") return <PackageResults packages={session.packages} warning={session.warning} checkout={checkout} busy={busy} onCheckout={openCheckout} onReset={reset} />;
  return <Intent session={session} busy={busy} setSession={setSession} onSubmit={begin} onReset={reset} />;
}

function Intent({ session, busy, setSession, onSubmit, onReset }: { session: Session; busy: boolean; setSession: Dispatch<SetStateAction<Session>>; onSubmit: (event?: FormEvent) => void; onReset: () => void }) {
  const isError = session.phase === "error";
  return <section className="discover-shell" aria-labelledby="discover-title"><div className="discover-intro"><h1 id="discover-title">Куда вам хочется <em>на самом деле?</em></h1><p className="lede">Начните с ощущения, места или свободных дней. Мы бережно сузим выбор до поездок, которые можно сравнить.</p><RouteThread /></div>
    <form className="intent-card" onSubmit={onSubmit}><label htmlFor="trip-intent">Что вы хотите получить от этой поездки?</label><textarea id="trip-intent" rows={4} value={session.prompt} onChange={(event) => setSession((s) => ({ ...s, prompt: event.target.value, phase: "intent", error: undefined }))} placeholder="Например: хочу на несколько дней к морю, хорошую еду и никаких ранних подъёмов" />
      <div className="quick-prompts">{quickPrompts.map((prompt) => <button className="chip" type="button" key={prompt} onClick={() => setSession((s) => ({ ...s, prompt }))}>{prompt}</button>)}</div><button className="button button-primary button-wide" type="submit" disabled={busy || !session.prompt.trim()}>{busy ? "Собираем направления…" : "Показать возможности"} <span aria-hidden="true">→</span></button>
      {isError && <div className="inline-error" role="alert"><strong>Пока не получилось.</strong><span>{session.error}</span><button type="button" className="text-link" onClick={() => onSubmit()}>Попробовать ещё раз</button></div>}</form><p className="quiet-note">Не знаете, с чего начать? <Link to="/guide">Читайте двухминутный гид</Link>.</p>{isError && <button className="reset-link" type="button" onClick={onReset}>Начать заново</button>}</section>;
}

function Clarify({ session, busy, setSession, onSubmit }: { session: Session; busy: boolean; setSession: Dispatch<SetStateAction<Session>>; onSubmit: (event?: FormEvent) => void }) {
  return <section className="discover-shell narrow" aria-labelledby="clarify-title"><div className="discover-intro"><h1 id="clarify-title">Пара коротких <em>ориентиров.</em></h1><p className="lede">Они нужны только для того, чтобы реальные варианты были релевантными.</p><RouteThread /></div>
    <form className="intent-card clarify-card" onSubmit={onSubmit}>{session.questions.map((question) => <label key={question.id} htmlFor={question.id}>{question.prompt}<input id={question.id} value={session.answers[question.id] ?? ""} placeholder={question.id === "dates" ? "Например, 2026-09-12 и 2026-09-15" : "Напишите, как вам удобно"} onChange={(event) => setSession((s) => ({ ...s, answers: { ...s.answers, [question.id]: event.target.value } }))} required /></label>)}<button className="button button-primary button-wide" type="submit" disabled={busy}>{busy ? "Собираем маршрут…" : "Показать 8 направлений"} <span aria-hidden="true">→</span></button></form></section>;
}

function Reveal({ session, signals, loading, onBuild, onReset }: { session: Session; signals: string[]; loading: boolean; onBuild: () => void; onReset: () => void }) {
  const canBuild = session.likes.length > 0;
  return <section className="discover-shell reveal-shell" aria-labelledby="reveal-title"><div className="reveal-mark">0{session.likes.length}</div><h1 id="reveal-title">Вам важны не просто города. Вам важен <em>ритм.</em></h1><RouteThread />
    <div className="signal-panel"><p>Ваши сигналы</p><div className="signal-list">{(signals.length ? signals : ["новые впечатления", "свой темп"]).map((signal) => <span key={signal}>{signal}</span>)}</div><p className="muted">Вы отметили {session.likes.length} из 8 направлений. Для живого расчёта берём максимум два самых близких варианта.</p></div>
    {session.error && <div className="inline-error" role="alert">{session.error}</div>}{loading ? <LoadingRoute /> : <><button className="button button-primary button-wide" type="button" onClick={onBuild} disabled={!canBuild}>{canBuild ? "Собрать живые варианты" : "Нужно отметить хотя бы один вариант"} <span aria-hidden="true">→</span></button><button className="reset-link" type="button" onClick={onReset}>Пройти маршрут заново</button></>}</section>;
}

function LoadingRoute() { return <div className="loading-route" role="status"><RouteThread label="Собираем поездку" /><p>Смотрим дорогу и проживание в Туту</p><span>Сначала ищем самые понятные сочетания — без придуманных цен.</span></div>; }

function PackageResults({ packages, warning, checkout, busy, onCheckout, onReset }: { packages: PackageOption[]; warning?: string; checkout: CheckoutResult | null; busy: boolean; onCheckout: (ref: unknown) => void; onReset: () => void }) {
  return <section className="discover-shell packages-shell" aria-labelledby="packages-title"><div className="discover-intro"><h1 id="packages-title">Вот что можно <em>собрать прямо сейчас.</em></h1><p className="lede">Цены и наличие пришли из Туту. Поездка будет состоять из отдельных бронирований, поэтому итог отмечен как ориентир.</p><RouteThread /></div>
    {warning && <div className="warning" role="status">{warning}</div>}<div className="package-list">{packages.map((item) => <PackageCard key={item.id} item={item} busy={busy} onCheckout={onCheckout} />)}</div>
    {checkout && <div className="checkout-ready" role="status"><p className="eyebrow">ссылка готова</p><strong>Продолжим на Туту</strong>{checkout.note && <span>{checkout.note}</span>}<a className="button button-primary" href={checkout.url} target="_blank" rel="noreferrer">Открыть бронирование <span aria-hidden="true">↗</span></a></div>}<button className="reset-link" type="button" onClick={onReset}>Начать новый маршрут</button></section>;
}

function PackageCard({ item, busy, onCheckout }: { item: PackageOption; busy: boolean; onCheckout: (ref: unknown) => void }) {
  const transport = item.transport; const hotel = item.hotel; const ref = item.checkoutRef ?? transport?.checkoutRef ?? hotel?.checkoutRef;
  return <article className="package-card"><div className="package-card-head"><span className="package-number">вариант</span><span className="price-kind">ориентировочная цена</span></div><h2>{item.title ?? item.destination ?? "Маршрут в Туту"}</h2><div className="package-price">{formatRub(item.price?.amount, item.price?.currency)}<small>{item.price?.confidence === "estimated_split_trip" ? "за дорогу и проживание вместе" : "актуальная стоимость"}</small></div><RouteThread label="Состав поездки" />
    <div className="package-parts"><div><span>дорога</span><strong>{transport?.mode ?? transport?.title ?? "Вариант транспорта"}</strong><p>{transport?.summary ?? "Детали откроются на стороне Туту."}</p></div>{hotel && <div><span>проживание</span><strong>{hotel.name ?? hotel.title ?? "Отель"}</strong><p>{hotel.summary ?? "Подберём вариант под ваш маршрут."}</p></div>}</div>{ref && <button className="button button-secondary button-wide" type="button" disabled={busy} onClick={() => onCheckout(ref)}>{busy ? "Готовим ссылку…" : "Перейти к бронированию"} <span aria-hidden="true">↗</span></button>}</article>;
}

function messageOf(error: unknown) { return error instanceof Error ? error.message : "Что-то пошло не так. Попробуйте ещё раз."; }
