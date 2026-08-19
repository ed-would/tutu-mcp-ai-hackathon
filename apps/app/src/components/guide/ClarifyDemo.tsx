import { useState } from "react";
import { ClarifyForm } from "../discover/ClarifyForm";

export function ClarifyDemo() {
  const [rehearsed, setRehearsed] = useState(false);

  return (
    <div className="intent-card guide-demo-card guide-ticket">
      <p className="guide-rehearsal">репетиция · никуда не уйдёт</p>
      <ClarifyForm
        answers={{}}
        busy={false}
        onSubmit={() => setRehearsed(true)}
      />
      {rehearsed ? (
        <p className="guide-demo-note" role="status">
          В настоящем маршруте после этого появятся восемь открыток.
        </p>
      ) : null}
    </div>
  );
}
