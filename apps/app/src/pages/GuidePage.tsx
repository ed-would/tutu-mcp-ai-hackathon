import { Link } from "react-router-dom";

const steps = [
  ["01", "Name the feeling", "Describe the kind of break you need in your own words."],
  ["02", "Keep what pulls you in", "Like the ideas that feel right. Your choices tune the next set."],
  ["03", "Choose with context", "See transport, hotel, and price together before going to Tutu to book."],
];

export function GuidePage() {
  return (
    <section className="page page-guide" aria-labelledby="guide-title">
      <div className="page-intro">
        <p className="eyebrow">Your route · guide</p>
        <h1 id="guide-title">A trip can start with a hunch.</h1>
        <p className="lede">Travel Tinder turns that hunch into a short list you can actually feel good about.</p>
      </div>
      <ol className="guide-steps">
        {steps.map(([number, title, body]) => (
          <li className="guide-step" key={number}>
            <span className="step-number">{number}</span>
            <div><h2>{title}</h2><p>{body}</p></div>
          </li>
        ))}
      </ol>
      <div className="guide-callout">
        <p className="eyebrow">One useful detail</p>
        <p>Prices are marked as exact or estimated. Booking and payment always continue on Tutu.</p>
      </div>
      <Link className="button button-primary" to="/discover">Try it with your trip <span aria-hidden="true">→</span></Link>
    </section>
  );
}
