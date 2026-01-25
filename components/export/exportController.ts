import { jsPDF } from "jspdf";
import { exportKontaktbogenTextPDF, Person } from "./exportText";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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
  kapitalnarkt: "kapitalmarktScreenshot",
  lebensplan: "lebensplanScreenshot",
  abs: "absScreenshot1",
  beratung: "absScreenshot2",
  service: "absScreenshot3",
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

/**
 * Prüft ob wir auf einer nativen Plattform (iOS/Android) laufen
 */
function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Speichert PDF und teilt es (Capacitor) oder lädt es herunter (Browser)
 */
async function saveOrDownloadPDF(doc: jsPDF, fileName: string): Promise<void> {
  if (!isNativePlatform()) {
    // Browser: normaler Download
    doc.save(fileName);
    return;
  }

  try {
    // Native: PDF als base64 extrahieren
    const pdfBase64 = doc.output('dataurlstring');
    const base64 = pdfBase64.split(',')[1]; // "data:application/pdf;base64,..." -> nur base64 Teil

    // PDF ins Filesystem schreiben
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    console.log('PDF saved to:', result.uri);

    // PDF teilen
    await Share.share({
      title: 'OVB Firmenvorstellung',
      text: 'Ihre Firmenvorstellung',
      url: result.uri,
      dialogTitle: 'PDF teilen',
    });

  } catch (error) {
    console.error('Failed to save/share PDF:', error);
    throw new Error('PDF konnte nicht gespeichert oder geteilt werden');
  }
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

  const fileName = `Firmenvorstellung-${geberName}.pdf`;

  if (screenshots.length === 0) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await exportKontaktbogenTextPDF({ geberName, personen, notes, doc });
    await saveOrDownloadPDF(doc, fileName);
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

  await saveOrDownloadPDF(doc, fileName);

  if (onCleanupDialog) {
    setTimeout(() => onCleanupDialog(true), 100);
  }

  Object.values(SCREENSHOT_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
}