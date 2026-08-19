import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

const quickPrompts = ["A long weekend", "Somewhere warm", "A quiet reset"];

export function DiscoverPage() {
  const [prompt, setPrompt] = useState("");
  const [started, setStarted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStarted(prompt.trim().length > 0);
  }

  return (
    <section className="page page-discover" aria-labelledby="discover-title">
      <div className="page-intro">
        <p className="eyebrow">Your route · 01 / intent</p>
        <h1 id="discover-title">Where could you go next?</h1>
        <p className="lede">Start with a feeling, a place, or the time you have. We’ll make the possibilities easier to compare.</p>
      </div>
      <form className="intent-card" onSubmit={handleSubmit}>
        <label htmlFor="trip-intent">What are you hoping this trip gives you?</label>
        <textarea
          id="trip-intent"
          name="trip-intent"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="A few days by the sea, good food, no rushing…"
        />
        <div className="quick-prompts" aria-label="Quick prompts">
          {quickPrompts.map((quickPrompt) => (
            <button className="chip" type="button" key={quickPrompt} onClick={() => setPrompt(quickPrompt)}>{quickPrompt}</button>
          ))}
        </div>
        <button className="button button-primary button-wide" type="submit">Show me possibilities <span aria-hidden="true">→</span></button>
        {started && <p className="form-success" role="status">Your first route is taking shape. The card deck will appear here next.</p>}
      </form>
      <p className="quiet-note"><Link to="/guide">Not sure where to begin?</Link> Read the two-minute guide.</p>
    </section>
  );
}
