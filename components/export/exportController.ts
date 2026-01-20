import { jsPDF } from "jspdf";
import { exportKontaktbogenTextPDF, Person } from "./exportText";

/* =========================
   TYPES
   ========================= */

export type ExportData = {
  geberName: string;
  personen: Person[];
  notes?: string;
  onCleanupDialog?: (show: boolean) => void;
};

/* =========================
   SCREENSHOT KEYS
   ========================= */

const SCREENSHOT_KEYS = {
  lebensplan: "lebensplanScreenshot",
  werbung: "werbungScreenshot",
  empfehlung: "empfehlungScreenshot",
} as const;

/* =========================
   HELPER
   ========================= */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* =========================
   CONTROLLER
   ========================= */

export async function exportKontaktbogenToPDF(
  data: ExportData
): Promise<void> {
  const {
    geberName,
    personen,
    notes,
    onCleanupDialog,
  } = data;

  const screenshots = Object.entries(SCREENSHOT_KEYS)
    .map(([key, storageKey]) => ({
      name: key,
      image: sessionStorage.getItem(storageKey),
    }))
    .filter(s => s.image) as { name: string; image: string }[];

  if (screenshots.length === 0) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await exportKontaktbogenTextPDF({ geberName, personen, notes, doc });
    doc.save(`Firmenvorstellung-${geberName}.pdf`);
    return;
  }

  // PDF erstellen mit Custom-Größe basierend auf erstem Bild
  const firstImg = await loadImage(screenshots[0].image);
  const scale = 297 / firstImg.width;
  const pdfWidth = firstImg.width * scale;
  const pdfHeight = firstImg.height * scale;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });

  for (let i = 0; i < screenshots.length; i++) {
    const img = await loadImage(screenshots[i].image);
    const imgScale = 297 / img.width;
    const pageWidth = img.width * imgScale;
    const pageHeight = img.height * imgScale;

    if (i > 0) {
      doc.addPage([pageWidth, pageHeight], "landscape");
    }

    doc.addImage(
      screenshots[i].image,
      "JPEG",
      0, 0,
      pageWidth, pageHeight,
      undefined,
      "FAST"
    );
  }

  // Textseite A4 Portrait
  doc.addPage([210, 297], "portrait");
  await exportKontaktbogenTextPDF({ geberName, personen, notes, doc });

  doc.save(`Firmenvorstellung-${geberName}.pdf`);

  if (onCleanupDialog) {
    setTimeout(() => onCleanupDialog(true), 100);
  }

  Object.values(SCREENSHOT_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
}