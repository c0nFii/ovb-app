"use client";

import { useState } from "react";
import ZieleFlow from "./ZieleFlow";
import ProduktePfeilFlow from "./SituationsPfeil";

export default function FlowController() {
  const [showProdukte, setShowProdukte] = useState(false);

  return (
    <>
      {/* 🔹 BASIS-FLOW – BLEIBT IMMER */}
      <ZieleFlow onDone={() => setShowProdukte(true)} />

      {/* 🔹 OVERLAY-FLOW – KOMMT DAZU */}
      {showProdukte && (
        <ProduktePfeilFlow onDone={() => console.log("Next phase")} />
      )}
    </>
  );
}
