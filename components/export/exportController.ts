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
  werbung: "werbungScreenshot",
  empfehlung: "empfehlungScreenshot",
  // 👇 Einfach weitere Seiten hinzufügen:
  // produkte: "produkteScreenshot",
  // beratung: "beratungScreenshot",
} as const;

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

  /* =========================
     📸 SCREENSHOTS AUS SESSION STORAGE
     ========================= */

  const screenshots = Object.entries(SCREENSHOT_KEYS).map(([key, storageKey]) => ({
    name: key,
    image: sessionStorage.getItem(storageKey),
  })).filter(s => s.image); // Nur vorhandene

  const hasScreenshots = screenshots.length > 0;

  /* =========================
     PDF INITIALISIEREN
     ========================= */

  const doc = new jsPDF({
    orientation: hasScreenshots ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  /* =========================
     1️⃣ ALLE SCREENSHOTS EINFÜGEN (FIT TO A4)
     ========================= */

  for (let i = 0; i < screenshots.length; i++) {
    const { image } = screenshots[i];
    
    if (i > 0) {
      doc.addPage("a4", "landscape");
    }

    // 👇 Bild laden
    const img = new Image();
    img.src = image!;
    
    await new Promise<void>((resolve) => {
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;

        // 👇 A4 Querformat in mm
        const pageWidth = 297;
        const pageHeight = 210;

        // 🔴 KRITISCH: Aspect Ratios berechnen
        const imgAspectRatio = imgWidth / imgHeight;
        const pageAspectRatio = pageWidth / pageHeight;

        let pdfWidth: number;
        let pdfHeight: number;

        // 🔴 Bild ist breiter als Seite → an Breite anpassen
        if (imgAspectRatio > pageAspectRatio) {
          pdfWidth = pageWidth;
          pdfHeight = pageWidth / imgAspectRatio;
        } 
        // 🔴 Bild ist höher als Seite → an Höhe anpassen
        else {
          pdfHeight = pageHeight;
          pdfWidth = pageHeight * imgAspectRatio;
        }

        // 👇 Zentrieren
        const x = (pageWidth - pdfWidth) / 2;
        const y = (pageHeight - pdfHeight) / 2;

        doc.addImage(
          image!,
          "JPEG",
          x,
          y,
          pdfWidth,
          pdfHeight,
          undefined,
          "FAST"
        );

        resolve();
      };
    });
  }

  /* =========================
     🔄 WECHSEL ZU PORTRAIT (nur bei Screenshots)
     ========================= */

  if (hasScreenshots) {
    doc.addPage("a4", "portrait");
  }

  /* =========================
     2️⃣ TEXT (NOTIZEN + EMPFEHLUNGEN)
     ========================= */

  await exportKontaktbogenTextPDF({
    geberName,
    personen,
    notes,
    doc,
  });

  /* =========================
     DOWNLOAD
     ========================= */

  doc.save(`Firmenvorstellung-${geberName}.pdf`);

  /* =========================
     CLEANUP
     ========================= */

  if (onCleanupDialog) {
    setTimeout(() => {
      onCleanupDialog(true);
    }, 100);
  }

  // 🧹 Screenshots aus sessionStorage löschen
  Object.values(SCREENSHOT_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
}