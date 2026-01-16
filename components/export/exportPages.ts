"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { exportKontaktbogenTextPDF, Person } from "./exportText";

/* =========================
   TYPES
   ========================= */

export type ExportPageOptions = {
  containerId: string;
  fileName?: string;
  backgroundColor?: string;
  quality?: number;
  targetWidth?: number; // px
  targetHeight?: number; // px
};

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
   PAGE EXPORT (DOWNLOAD)
   ========================= */

export async function exportPageContainer(
  options: ExportPageOptions
): Promise<void> {
  const {
    containerId,
    fileName = "export.jpg",
    backgroundColor = "#ffffff",
    quality = 0.85,
    targetWidth,
    targetHeight,
  } = options;

  const dataUrl = await exportPageContainerAsImage({
    containerId,
    backgroundColor,
    quality,
    targetWidth,
    targetHeight,
  });

  downloadImage(dataUrl, fileName);
}

/* =========================
   PAGE EXPORT (DATA URL)
   - robust for desktop & tablet (considers devicePixelRatio)
   ========================= */

export async function exportPageContainerAsImage(
  options: Omit<ExportPageOptions, "fileName">
): Promise<string> {
  const {
    containerId,
    backgroundColor = "#ffffff",
    quality = 0.85,
    // sensible defaults for a landscape screenshot (px)
    targetWidth = 1920,
    targetHeight = 1080,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Export container not found: ${containerId}`);

  // Clone the container so we can manipulate layout for export without affecting the app
  const clone = container.cloneNode(true) as HTMLElement;

  // Ensure clone has no id conflicts and is isolated
  clone.id = `${containerId}-export-clone`;

  // Apply fixed export size to the clone and reset transforms
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.position = "absolute";
  clone.style.top = "-99999px";
  clone.style.left = "-99999px";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxSizing = "border-box";
  clone.style.background = backgroundColor;
  clone.style.pointerEvents = "none";

  // Append clone to body so html2canvas can render it
  document.body.appendChild(clone);

  // Wait a tick so fonts/images/rendering settle
  await new Promise((r) => setTimeout(r, 80));

  // Compute scale for crispness (use devicePixelRatio)
  const deviceScale = Math.max(window.devicePixelRatio || 1, 1);
  // Limit scale to avoid extremely large canvases on very high DPR devices (tablets/retina)
  const scale = Math.min(deviceScale, 2);

  // Render with html2canvas
  const canvas = await html2canvas(clone, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
    width: targetWidth,
    height: targetHeight,
    windowWidth: targetWidth,
    windowHeight: targetHeight,
    foreignObjectRendering: false,
  });

  // Cleanup clone
  document.body.removeChild(clone);

  // Return JPEG data URL
  return canvas.toDataURL("image/jpeg", quality);
}

/* =========================
   DOWNLOAD HELPER
   ========================= */

function downloadImage(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================
   EXPORT KONTAKTOGEN → PDF
   - reads screenshots from sessionStorage
   - converts px → mm correctly (considers devicePixelRatio)
   - fits images proportionally on A4 landscape pages
   ========================= */

export async function exportKontaktbogenToPDF(
  data: ExportData
): Promise<void> {
  const { geberName, personen, notes, onCleanupDialog } = data;

  // Collect screenshots from sessionStorage
  const screenshots = Object.entries(SCREENSHOT_KEYS)
    .map(([name, storageKey]) => ({
      name,
      image: sessionStorage.getItem(storageKey),
    }))
    .filter((s) => s.image) as { name: string; image: string }[];

  const hasScreenshots = screenshots.length > 0;

  // Initialize jsPDF
  const doc = new jsPDF({
    orientation: hasScreenshots ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // A4 sizes in mm
  const A4_WIDTH_MM = 297;
  const A4_HEIGHT_MM = 210;

  // Helper: convert image (dataURL) to Image and wait for load
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img); // resolve anyway to avoid blocking
    });

  // Insert screenshots (fit to A4 landscape)
  for (let i = 0; i < screenshots.length; i++) {
    const { image } = screenshots[i];

    if (i > 0) {
      doc.addPage("a4", "landscape");
    }

    const img = await loadImage(image!);

    // Use naturalWidth/naturalHeight for true pixel dimensions
    const imgPixelWidth = img.naturalWidth || img.width;
    const imgPixelHeight = img.naturalHeight || img.height;

    // Base DPI (CSS px reference). Browsers typically use 96 DPI.
    const baseDpi = 96;
    const deviceScale = Math.max(window.devicePixelRatio || 1, 1);
    const effectiveDpi = baseDpi * deviceScale;

    // mm per pixel
    const mmPerPx = 25.4 / effectiveDpi;

    // Convert image pixel size to mm
    let imgMmWidth = imgPixelWidth * mmPerPx;
    let imgMmHeight = imgPixelHeight * mmPerPx;

    // Fit image into A4 landscape while preserving aspect ratio
    const pageWidth = A4_WIDTH_MM;
    const pageHeight = A4_HEIGHT_MM;

    const widthScale = pageWidth / imgMmWidth;
    const heightScale = pageHeight / imgMmHeight;
    const scale = Math.min(widthScale, heightScale, 1); // don't upscale beyond 100%

    const pdfWidth = imgMmWidth * scale;
    const pdfHeight = imgMmHeight * scale;

    // Center on page
    const x = (pageWidth - pdfWidth) / 2;
    const y = (pageHeight - pdfHeight) / 2;

    // Add image to PDF
    doc.addImage(image!, "JPEG", x, y, pdfWidth, pdfHeight, undefined, "FAST");
  }

  // If we added screenshots, add a portrait page for the text afterwards
  if (hasScreenshots) {
    doc.addPage("a4", "portrait");
  }

  // Add text (notes, recommendations) using helper
  await exportKontaktbogenTextPDF({
    geberName,
    personen,
    notes,
    doc,
  });

  // Save PDF
  doc.save(`Firmenvorstellung-${geberName}.pdf`);

  // Cleanup: show dialog if requested
  if (onCleanupDialog) {
    setTimeout(() => {
      onCleanupDialog(true);
    }, 100);
  }

  // Remove screenshots from sessionStorage
  Object.values(SCREENSHOT_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });
}
