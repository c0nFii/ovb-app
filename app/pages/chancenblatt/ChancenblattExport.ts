import { jsPDF } from "jspdf";
import { QUESTIONS } from "./ChancenblattQuestions";
import { ErgebnisTyp } from "./ChancenblattFlow";

const OVB_BLUE: [number, number, number] = [1, 63, 114];

/**
 * Lädt ein Bild aus /public und gibt es als Base64 zurück
 */
async function loadImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Exportiert das Chancenblatt als PDF inkl. Logo, Ergebnis & Fragen
 */
export async function exportChancenblattPDF(
  type: ErgebnisTyp,
  content: { title: string; text: string; hint: string },
  answers: Record<string, string>
) {
  const pdf = new jsPDF();

 // Logo laden
const logoBase64 = await loadImageAsBase64("/ovb.png");

// Bild-Eigenschaften auslesen
const imgProps = pdf.getImageProperties(logoBase64);

// Logo-Größe (bewusst klein & ruhig)
const logoWidth = 28;
const logoHeight = (imgProps.height * logoWidth) / imgProps.width;

// Positionen
const logoX = 20;
const logoY = 20;
const textX = logoX + logoWidth + 10; // Abstand rechts vom Logo
const textWidth = 190 - textX;

// Logo platzieren
pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);

// Start-Y für Text (oben bündig mit Logo)
let y = logoY;

// Titel rechts neben dem Logo
pdf.setFont("helvetica", "bold");
pdf.setFontSize(18);
pdf.setTextColor(...OVB_BLUE);
pdf.text(content.title, textX, y + 6, { maxWidth: textWidth });
y += 26;

// Beschreibung
pdf.setFont("helvetica", "normal");
pdf.setFontSize(12);
pdf.text(content.text, textX, y, { maxWidth: textWidth });
y += 16;
pdf.text(content.hint, textX, y, { maxWidth: textWidth });

// Nach Header unter Logo + Text springen
y = Math.max(logoY + logoHeight, y) + 20;


  // Abschnittsüberschrift
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Fragen & Antworten", 20, y);
  y += 10;

  QUESTIONS.forEach((q, index) => {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    if (!opt) return;

    // Seitenumbruch
    if (y > 260) {
      pdf.addPage();
      y = 30;
    }

    // Trennlinie
    pdf.setDrawColor(...OVB_BLUE);
    pdf.setLineWidth(0.3);
    pdf.line(20, y, 190, y);
    y += 6;

    // Frage
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...OVB_BLUE);
    pdf.text(`${index + 1}. ${q.text}`, 20, y, { maxWidth: 170 });
    y += 8;

    // Antwort (dezenter)
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(1, 63, 114, 0.75);
    pdf.text(opt.label, 24, y, { maxWidth: 166 });
    y += 12;
  });

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text("Chancenblatt – persönliche Einschätzung", 20, 285);

  pdf.save("chancenblatt.pdf");
}
