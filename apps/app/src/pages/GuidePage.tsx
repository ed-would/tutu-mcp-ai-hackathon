import { GuideTour } from "../components/guide/GuideTour";
import "../styles/guide.css";

export function GuidePage() {
  return (
    <section className="page page-guide" aria-labelledby="guide-title">
      <GuideTour />
    </section>
  );
}
