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

  /* =========================
     LOGO – EXAKT WIE KONTAKTBOGEN
     ========================== */

  const logo = new Image();
  logo.src = "/ovb.png";

  await new Promise<void>((resolve) => {
    logo.onload = () => resolve();
  });

  const logoWidth = 28;
  const logoHeight = (logo.height * logoWidth) / logo.width;

  const logoX = 20;
  const logoY = 20;
  const textX = logoX + logoWidth + 10;
  const textWidth = 190 - textX;

  pdf.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);

  let y = logoY;

  /* =========================
     HEADER
     ========================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...OVB_BLUE);
  pdf.text(content.title, textX, y + 6, { maxWidth: textWidth });

  y += 26;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(content.text, textX, y, { maxWidth: textWidth });

  y += 16;
  pdf.text(content.hint, textX, y, { maxWidth: textWidth });

  y = Math.max(logoY + logoHeight, y) + 20;

  /* =========================
     FRAGEN
     ========================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Fragen & Antworten", 20, y);
  y += 10;

  QUESTIONS.forEach((q, index) => {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    if (!opt) return;

    if (y > 260) {
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
    pdf.text(`${index + 1}. ${q.text}`, 20, y, { maxWidth: 170 });
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(1, 63, 114, 0.75);
    pdf.text(opt.label, 24, y, { maxWidth: 166 });
    y += 12;
  });

  /* =========================
     FOOTER
     ========================== */

  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text("Chancenblatt – persönliche Einschätzung", 20, 285);

  /* =========================
     RETURN
     ========================== */

  const fileName = `Chancenblatt-${type}.pdf`;
  const blob = pdf.output("blob");

  return { fileName, blob };
}
