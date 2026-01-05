"use client";

import { useState } from "react";
import { ErgebnisTyp } from "./ChancenblattFlow";
import NameDialog from "../kontaktbogen/NameDialog";

const OVB_BLUE = "#013F72";

export default function ChancenblattAuswertung({
  type,
  answers,
}: {
  type: ErgebnisTyp;
  answers: Record<string, string>;
}) {
  /* =========================
     AUSWERTUNGS-INHALTE
     ========================= */

  const content = {
    O: {
      title: "Du wirkst offen, neugierig und entwicklungsorientiert.",
      text:
        "Menschen mit dieser Haltung sehen Möglichkeiten oft dort, wo andere noch zögern. Sie übernehmen gern Verantwortung und entwickeln sich kontinuierlich weiter.",
      hint:
        "Spannend ist: Viele, die heute eng mit uns zusammenarbeiten, haben genau mit dieser Offenheit begonnen – ganz ohne konkrete Erwartungen.",
    },
    A: {
      title: "Du triffst Entscheidungen bewusst und mit Klarheit.",
      text:
        "Du möchtest Zusammenhänge verstehen, bevor du dich festlegst. Struktur, Zahlen und langfristige Perspektiven geben dir Sicherheit.",
      hint:
        "Viele mit einem ähnlichen Profil wollten anfangs lediglich Einblick – und haben dann gemerkt, wie gut unsere Arbeitsweise zu ihnen passt.",
    },
    S: {
      title: "Dir sind Eigenverantwortung und klare Strukturen wichtig.",
      text:
        "Du arbeitest gern selbstständig, schätzt aber ein stabiles System im Hintergrund. Dein Tempo bestimmst du am liebsten selbst.",
      hint:
        "Genau dafür ist unser System gemacht: Freiheit in der Umsetzung, Klarheit in den Strukturen.",
    },
    V: {
      title: "Du gehst bedacht vor und entscheidest verantwortungsvoll.",
      text:
        "Du prüfst neue Themen in Ruhe und legst Wert auf Sicherheit und Verlässlichkeit. Das sorgt oft für besonders nachhaltige Entscheidungen.",
      hint:
        "Viele, die heute sehr zufrieden bei uns sind, haben genau so begonnen: erst beobachten, dann verstehen – und dann bewusst entscheiden.",
    },
  }[type];

  /* =========================
     NAME DIALOG STATE
     ========================= */

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [kundenName, setKundenName] = useState("");

  /* =========================
     EXPORT
     ========================= */

  const confirmExport = async () => {
    if (!kundenName.trim()) return;

    setShowNameDialog(false);

    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "chancenblatt",
        ergebnisTyp: type,
        kundenName,
        content,
        answers,
      }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 📱 Mobile → Share (nur HTTPS!)
    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({
          url,
          title: `Chancenblatt ${kundenName}`,
        });
        return;
      } catch {
        // Abbruch → Download
      }
    }

    // 🖥 Desktop / Fallback → Download
    const a = document.createElement("a");
    a.href = url;
    a.download = `Chancenblatt-${kundenName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* =========================
     RENDER
     ========================= */

  return (
    <>
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
          onClick={() => setShowNameDialog(true)}
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            background: OVB_BLUE,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          Ergebnis sichern
        </button>

        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translate(-50%, -45%); }
            100% { opacity: 1; transform: translate(-50%, -50%); }
          }
        `}</style>
      </div>

      {showNameDialog && (
        <NameDialog
          value={kundenName}
          onChange={setKundenName}
          onCancel={() => setShowNameDialog(false)}
          onConfirm={confirmExport}
        />
      )}
    </>
  );
}
