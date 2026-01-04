"use client";

import { ErgebnisTyp } from "./ChancenblattFlow";
import { exportChancenblattPDF } from "./ChancenblattExport";

const OVB_BLUE = "#013F72";

export default function ChancenblattAuswertung({
  type,
  answers,
}: {
  type: ErgebnisTyp;
  answers: Record<string, string>;
}) {
  const content = {
    O: {
      title: "Du wirkst offen, neugierig und entwicklungsorientiert.",
      text:
        "Menschen mit dieser Haltung sehen Möglichkeiten oft dort, wo andere noch zögern. Sie mögen es, Verantwortung zu übernehmen, sich weiterzuentwickeln und neue Wege zu gehen.",
      hint:
        "Interessant ist: Viele, die heute eng mit uns zusammenarbeiten, haben genau mit dieser Offenheit begonnen – ganz ohne konkrete Erwartungen.",
    },
    A: {
      title: "Du triffst Entscheidungen bewusst und mit Klarheit.",
      text:
        "Du möchtest verstehen, wie Dinge funktionieren, bevor du dich festlegst. Zahlen, Zusammenhänge und langfristige Perspektiven spielen für dich eine große Rolle.",
      hint:
        "Viele mit einem ähnlichen Profil wollten anfangs nur Einblick – und haben dann gemerkt, dass unsere Arbeitsweise sehr gut zu ihnen passt.",
    },
    S: {
      title: "Dir sind Struktur, Eigenverantwortung und Stabilität wichtig.",
      text:
        "Du arbeitest gern verlässlich, möchtest dein Tempo selbst bestimmen und suchst ein Umfeld, das Sicherheit gibt, ohne einzuengen.",
      hint:
        "Genau dafür ist unser System gedacht: klare Strukturen im Hintergrund und Freiheit in der Umsetzung.",
    },
    V: {
      title: "Du gehst bedacht vor und übernimmst Verantwortung.",
      text:
        "Du prüfst neue Themen in Ruhe und triffst Entscheidungen lieber auf einer soliden Grundlage. Diese Haltung sorgt oft für besonders nachhaltige Wege.",
      hint:
        "Viele, die heute sehr zufrieden bei uns sind, haben genau so begonnen: erst beobachten, dann verstehen – und dann bewusst entscheiden.",
    },
  }[type];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "700px",
        color: OVB_BLUE,
        textAlign: "center",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(18px, 2.4vw, 22px)",
          marginBottom: "14px",
          fontWeight: 600,
        }}
      >
        {content.title}
      </h2>

      <p
        style={{
          marginBottom: "12px",
          fontSize: "clamp(14px, 1.8vw, 16px)",
          lineHeight: 1.5,
        }}
      >
        {content.text}
      </p>

      <p
        style={{
          marginBottom: "24px",
          fontSize: "clamp(14px, 1.8vw, 16px)",
          lineHeight: 1.5,
          opacity: 0.95,
        }}
      >
        {content.hint}
      </p>

      <button
        onClick={() => exportChancenblattPDF(type, content, answers)}
        style={{
          marginTop: 10,
          padding: "14px 28px",
          borderRadius: 999,
          background: OVB_BLUE,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        Ergebnis speichern
      </button>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translate(-50%, -45%); }
          100% { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
}
