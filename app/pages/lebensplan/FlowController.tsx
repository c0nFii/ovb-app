"use client";

import { useState } from "react";
import ZieleFlow from "./ZieleFlow";
import ProduktePfeilFlow from "./SituationsPfeil";

type FlowControllerProps = {
  onComplete?: () => void;
};

export default function FlowController({ onComplete }: FlowControllerProps) {
  const [showProdukte, setShowProdukte] = useState(false);

  return (
    <>
      <ZieleFlow onDone={() => setShowProdukte(true)} />

      {showProdukte && (
        <ProduktePfeilFlow
          onDone={() => {
            onComplete?.(); // 🔴 HIER ist der Abschluss
          }}
        />
      )}
    </>
  );
}
