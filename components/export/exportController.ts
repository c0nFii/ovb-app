import { jsPDF } from "jspdf";

/* =========================
   TYPES
   ========================= */

export type Person = {
  name: string;
  ort: string;
  alter: string;
  beruf: string;
  telefon: string;
  bemerkung: string;
};

export type ExportData = {
  geberName: string;
  personen: Person[];
  notes?: string;
  onCleanupDialog?: (show: boolean) => void;
};

/* =========================
   LOGO LADEN
   ========================= */

async function loadOVBLogo(): Promise<string> {
  const response = await fetch("/ovb.png");
  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/* =========================
   PDF EXPORT
   ========================= */

export async function exportKontaktbogenToPDF(data: ExportData): Promise<void> {
  const { geberName, personen, notes, onCleanupDialog } = data;

  const OVB_BLUE = "#013F72";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const logo = await loadOVBLogo();

  /* =========================
     SEITE 1 – NOTIZEN
     ========================= */

  doc.addImage(logo, "PNG", 20, 10, 25, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(OVB_BLUE);
  doc.text(["Notizen", geberName], 105, 40, { align: "center" });

  let yPos = 70;

  if (notes && notes.trim().length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(OVB_BLUE);

    const wrapped = doc.splitTextToSize(notes, 170);
    doc.text(wrapped, 20, yPos);
  }

  /* =========================
     SEITE 2 – EMPFEHLUNGEN
     ========================= */

  doc.addPage();

  doc.addImage(logo, "PNG", 20, 10, 25, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(OVB_BLUE);
  doc.text(["Empfehlungen", geberName], 105, 40, { align: "center" });

  yPos = 70;
  const lineHeight = 7;
  const sectionGap = 10;

  personen.forEach((person, index) => {
    const isLast = index === personen.length - 1;

    // Höhe des Blocks berechnen
    const blockHeight = 6 * lineHeight + sectionGap;

    if (yPos + blockHeight > 260) {
      doc.addPage();
      yPos = 40; // kein Logo mehr ab Seite 3
    }

    const addField = (label: string, value?: string) => {
      if (!value) return;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(OVB_BLUE);
      doc.text(`${label}:`, 20, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(OVB_BLUE);
      doc.text(value, 55, yPos);

      yPos += lineHeight;
    };

    addField("Name", person.name);
    addField("Ort", person.ort);
    addField("Alter", person.alter);
    addField("Beruf", person.beruf);
    addField("Telefon", person.telefon);
    addField("Bemerkung", person.bemerkung);

    // 🔥 Nur Linie zeichnen, wenn es NICHT der letzte Kontakt ist
    if (!isLast) {
      yPos += 2;
      doc.setDrawColor(1, 63, 114);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += sectionGap;
    }
  });

  /* =========================
     DOWNLOAD
     ========================= */

  doc.save(`Firmenvorstellung-${geberName}.pdf`);

  /* =========================
     CLEANUP DIALOG
     ========================= */

  // Warte kurz, damit der Download startet, bevor der Dialog erscheint
  if (onCleanupDialog) {
    setTimeout(() => {
      onCleanupDialog(true);
    }, 100);
  }
}