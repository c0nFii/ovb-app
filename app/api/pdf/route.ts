import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import { QUESTIONS } from "@/app/pages/chancenblatt/ChancenblattQuestions";

/* =========================================================
   LOGO EINMAL SERVERSEITIG LADEN
   ========================================================= */

const logoPath = path.join(process.cwd(), "public", "ovb.png");
const logoBase64 = fs.readFileSync(logoPath).toString("base64");
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

export async function POST(req: Request) {
  const body = await req.json();
  const { type } = body;

  if (type === "empfehlungen") {
    return createEmpfehlungenPDF(body);
  }

  if (type === "chancenblatt") {
    return createChancenblattPDF(body);
  }

  return new NextResponse("Invalid PDF type", { status: 400 });
}

/* =========================================================
   EMPFEHLUNGEN (KONTAKTBOGEN)
   ========================================================= */

function createEmpfehlungenPDF({
  name,
  empfehlungen,
}: {
  name: string;
  empfehlungen: any[];
}) {
  const pdf = new jsPDF("p", "mm", "a4");

  const OVB_BLUE: [number, number, number] = [1, 63, 114];
  const pageWidth = 210;
  const pageHeight = 297;

  const logoWidth = 18;
  const logoProps = pdf.getImageProperties(logoDataUrl);
  const logoHeight = (logoProps.height * logoWidth) / logoProps.width;

  pdf.addImage(logoDataUrl, "PNG", 20, 20, logoWidth, logoHeight);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(...OVB_BLUE);
  pdf.text(`Empfehlungen ${name}`, pageWidth / 2, 30, { align: "center" });

  let y = 50;

  empfehlungen.forEach((e) => {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = 30;
    }

    const drawRow = (label: string, value?: string) => {
      if (!value) return;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...OVB_BLUE);
      pdf.text(`${label}:`, 20, y);

      pdf.setFont("helvetica", "normal");
      pdf.text(value, 55, y);
      y += 5;
    };

    drawRow("Name", e.name || "-");
    drawRow("Ort", e.ort);
    drawRow("Alter", e.alter);
    drawRow("Beruf", e.beruf);
    drawRow("Telefon", e.telefon);

    if (e.bemerkung) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Bemerkung:", 20, y);

      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(e.bemerkung, 135);
      pdf.text(lines, 55, y);
      y += lines.length * 5;
    }

    y += 4;
    pdf.setDrawColor(...OVB_BLUE);
    pdf.setLineWidth(0.3);
    pdf.line(20, y, 190, y);
    y += 8;
  });

  return pdfResponse(pdf, `Empfehlungen-${name}.pdf`);
}

/* =========================================================
   CHANCENBLATT (KUNDENNAME ALS FUSSNOTE)
   ========================================================= */

function createChancenblattPDF({
  ergebnisTyp,
  kundenName,
  content,
  answers,
}: any) {
  const pdf = new jsPDF();
  const OVB_BLUE: [number, number, number] = [1, 63, 114];
  const pageHeight = pdf.internal.pageSize.getHeight();

  const logoWidth = 28;
  const imgProps = pdf.getImageProperties(logoDataUrl);
  const logoHeight = (imgProps.height * logoWidth) / imgProps.width;

  pdf.addImage(logoDataUrl, "PNG", 20, 20, logoWidth, logoHeight);

  let y = 30;

  /* ---------- Titel & Text ---------- */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...OVB_BLUE);
  pdf.text(content.title, 60, y, { maxWidth: 120 });

  y += 20;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(content.text, 60, y, { maxWidth: 120 });
  y += 16;
  pdf.text(content.hint, 60, y, { maxWidth: 120 });

  y += 20;

  pdf.setFont("helvetica", "bold");
  pdf.text("Fragen & Antworten", 20, y);
  y += 10;

  QUESTIONS.forEach((q, i) => {
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
    pdf.text(`${i + 1}. ${q.text}`, 20, y, { maxWidth: 170 });
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(opt.label, 24, y, { maxWidth: 166 });
    y += 12;
  });

  /* ---------- Fußnote: Kundenname ---------- */

  if (kundenName) {
    const pageCount = pdf.getNumberOfPages();
    pdf.setPage(pageCount);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(120);

    pdf.text(
      `Chancenblatt – ${kundenName}`,
      20,
      pdf.internal.pageSize.getHeight() - 10
    );
  }

  return pdfResponse(pdf, `Chancenblatt-${ergebnisTyp}.pdf`);
}

/* =========================================================
   RESPONSE
   ========================================================= */

function pdfResponse(pdf: jsPDF, fileName: string) {
  const buffer = pdf.output("arraybuffer");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
