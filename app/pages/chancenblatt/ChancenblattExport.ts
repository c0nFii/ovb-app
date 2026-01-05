import { jsPDF } from "jspdf";
import { QUESTIONS } from "./ChancenblattQuestions";
import { ErgebnisTyp } from "./ChancenblattFlow";

const OVB_BLUE: [number, number, number] = [1, 63, 114];

export async function exportChancenblattPDF(
  type: ErgebnisTyp,
  content: { title: string; text: string; hint: string },
  answers: Record<string, string>
): Promise<{ fileName: string; blob: Blob }> {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();

  /* =========================
     LOGO (fehlertolerant)
     ========================== */

  let logoLoaded = false;
  const logo = new Image();
  logo.src = "/ovb.png";

  await new Promise<void>((resolve) => {
    logo.onload = () => {
      logoLoaded = true;
      resolve();
    };
    logo.onerror = () => resolve(); // ❗ weiter ohne Logo
  });

  const logoWidth = 28;
  const logoHeight = logoLoaded
    ? (logo.height * logoWidth) / logo.width
    : 0;

  const logoX = 20;
  const logoY = 20;

  const textX = logoLoaded ? logoX + logoWidth + 10 : 20;
  const textWidth = 190 - textX;

  if (logoLoaded) {
    pdf.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);
  }

  let y = logoY;

  /* =========================
     HEADER
     ========================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...OVB_BLUE);

  const titleLines = pdf.splitTextToSize(content.title, textWidth);
  pdf.text(titleLines, textX, y + 6);
  y += titleLines.length * 8 + 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  const textLines = pdf.splitTextToSize(content.text, textWidth);
  pdf.text(textLines, textX, y);
  y += textLines.length * 6 + 6;

  const hintLines = pdf.splitTextToSize(content.hint, textWidth);
  pdf.text(hintLines, textX, y);
  y += hintLines.length * 6 + 10;

  y = Math.max(logoY + logoHeight, y) + 10;

  /* =========================
     FRAGEN & ANTWORTEN
     ========================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Fragen & Antworten", 20, y);
  y += 10;

  QUESTIONS.forEach((q, index) => {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    if (!opt) return;

    if (y > pageHeight - 30) {
      pdf.addPage();
      y = 30;
    }

    pdf.setDrawColor(...OVB_BLUE);
    pdf.setLineWidth(0.3);
    pdf.line(20, y, 190, y);
    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...OVB_BLUE);

    const qLines = pdf.splitTextToSize(
      `${index + 1}. ${q.text}`,
      170
    );
    pdf.text(qLines, 20, y);
    y += qLines.length * 6;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(1, 63, 114, 0.75);

    const aLines = pdf.splitTextToSize(opt.label, 166);
    pdf.text(aLines, 24, y);
    y += aLines.length * 6 + 6;
  });

  /* =========================
     FOOTER (letzte Seite)
     ========================== */

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    "Chancenblatt – persönliche Einschätzung",
    20,
    pageHeight - 10
  );

  /* =========================
     RETURN
     ========================== */

  const fileName = `Chancenblatt-${type}.pdf`;
  const blob = pdf.output("blob");

  return { fileName, blob };
}
