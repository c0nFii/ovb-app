"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { ErgebnisTyp } from "./ChancenblattFlow";
import NameDialog from "../kontaktbogen/NameDialog";
import { QUESTIONS } from "./ChancenblattQuestions";


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

  // Logo laden
  const response = await fetch("/ovb.png");
  const blob = await response.blob();
  const logo = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  // PDF erstellen
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.addImage(logo, "PNG", 20, 10, 25, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(OVB_BLUE);
  doc.text(["Chancenblatt", kundenName], 105, 40, { align: "center" });

  let yPos = 70;

  /* =========================
     ERGEBNIS
     ========================= */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(OVB_BLUE);
  const wrappedTitle = doc.splitTextToSize(content.title, 170);
  doc.text(wrappedTitle, 20, yPos);
  yPos += wrappedTitle.length * 6 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const wrappedText = doc.splitTextToSize(content.text, 170);
  doc.text(wrappedText, 20, yPos);
  yPos += wrappedText.length * 6 + 2;

  const wrappedHint = doc.splitTextToSize(content.hint, 170);
  doc.text(wrappedHint, 20, yPos);
  yPos += wrappedHint.length * 6 + 8;

  /* =========================
   ANTWORTEN
   ========================= */

doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(OVB_BLUE);
doc.text("Antworten", 20, yPos);
yPos += 10;

QUESTIONS.forEach((question, index) => {
  const answerValue = answers[question.id];
  if (!answerValue) return;

  const selectedOption = question.options.find(
    (opt) => opt.value === answerValue
  );
  if (!selectedOption) return;

  // Seitenumbruch
  if (yPos > 260) {
    doc.addPage();
    yPos = 30;
  }

  // Frage (fett)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(OVB_BLUE);
  const qLines = doc.splitTextToSize(question.text, 170);
  doc.text(qLines, 20, yPos);
  yPos += qLines.length * 6 + 3;

  // Antwort
  doc.setFont("helvetica", "normal");
  const aLines = doc.splitTextToSize(selectedOption.label, 170);
  doc.text(aLines, 20, yPos);
  yPos += aLines.length * 6 + 3;

  // Trennlinie (nicht nach letzter Frage)
  if (index < QUESTIONS.length - 1) {
    doc.setDrawColor(1, 63, 114);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
  }
});



  /* =========================
     DOWNLOAD
     ========================= */

  doc.save(`Chancenblatt-${kundenName}.pdf`);
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