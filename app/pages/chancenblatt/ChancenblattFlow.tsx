"use client";

import { useState } from "react";
import { QUESTIONS } from "./ChancenblattQuestions";
import ChancenblattAuswertung from "./ChancenblattAuswertung";

const OVB_BLUE = "#013F72";

export type ErgebnisTyp = "O" | "A" | "S" | "V";

export default function ChancenblattFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [animDirection, setAnimDirection] = useState<"left" | "right">("left");
  const [finished, setFinished] = useState(false);
  const [resultType, setResultType] = useState<ErgebnisTyp | null>(null);

  const current = QUESTIONS[step];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const next = () => {
    if (!answers[current.id]) return;
    if (step + 1 < QUESTIONS.length) {
      setAnimDirection("left");
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const back = () => {
    if (step === 0) return;
    setAnimDirection("right");
    setStep(step - 1);
  };

  const finish = () => {
    let O = 0, A = 0, S = 0, V = 0;

    QUESTIONS.forEach((q) => {
      const val = answers[q.id];
      const opt = q.options.find((o) => o.value === val);
      if (!opt) return;
      if (opt.type === "O") O++;
      if (opt.type === "A") A++;
      if (opt.type === "S") S++;
      if (opt.type === "V") V++;
    });

    const max = Math.max(O, A, S, V);
    setResultType(
      O === max ? "O" :
      A === max ? "A" :
      S === max ? "S" : "V"
    );
    setFinished(true);
  };

  if (finished && resultType) {
    return <ChancenblattAuswertung type={resultType} answers={answers} />;
  }

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxWidth: "600px",
      color: OVB_BLUE,
      textAlign: "center",
    }}>
      <h2>{step + 1}. {current.text}</h2>

      {current.options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSelect(opt.value)}
          style={{
            display: "block",
            width: "100%",
            margin: "10px 0",
            padding: "12px",
            borderRadius: "10px",
            border: answers[current.id] === opt.value
              ? `2px solid ${OVB_BLUE}`
              : "1px solid #ccc",
            background: answers[current.id] === opt.value ? OVB_BLUE : "#fff",
            color: answers[current.id] === opt.value ? "#fff" : OVB_BLUE,
          }}
        >
          {opt.label}
        </button>
      ))}

      <div
  style={{
    marginTop: "28px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  }}
>
  <button
    onClick={back}
    disabled={step === 0}
    style={{
      flex: 1,
      padding: "12px 16px",
      borderRadius: "999px",
      border: "1px solid rgba(1,63,114,0.4)",
      background: "transparent",
      color: step === 0 ? "rgba(1,63,114,0.4)" : OVB_BLUE,
      fontSize: "14px",
      cursor: step === 0 ? "default" : "pointer",
      transition: "all 0.2s ease",
    }}
  >
    Zurück
  </button>

  <button
    onClick={next}
    disabled={!answers[current.id]}
    style={{
      flex: 1,
      padding: "12px 16px",
      borderRadius: "999px",
      border: "none",
      background: answers[current.id]
        ? OVB_BLUE
        : "rgba(1,63,114,0.4)",
      color: "#fff",
      fontSize: "14px",
      cursor: answers[current.id] ? "pointer" : "default",
      boxShadow: answers[current.id]
        ? "0 4px 12px rgba(0,0,0,0.15)"
        : "none",
      transition: "all 0.2s ease",
    }}
  >
    Weiter
  </button>
</div>

    </div>
  );
}
