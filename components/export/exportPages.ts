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
  targetWidth?: number;
  targetHeight?: number;
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
   ========================= */

export async function exportPageContainerAsImage(
  options: Omit<ExportPageOptions, "fileName">
): Promise<string> {
  const {
    containerId,
    backgroundColor = "#ffffff",
    quality = 0.85,
    targetWidth = 1920,
    targetHeight = 1080,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Export container not found: ${containerId}`);

  // 🔴 FIX: Alle vw/vh/clamp Werte VORHER in feste Pixel basierend auf targetWidth umrechnen
  const elementsToFix = container.querySelectorAll('*');
  const originalStyles = new Map<Element, { width?: string; height?: string }>();
  
  elementsToFix.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.style;
    
    // Original-Werte speichern
    originalStyles.set(el, {
      width: style.width,
      height: style.height,
    });
    
    // clamp(min, vw, max) bei targetWidth berechnen
    if (style.width && style.width.includes('clamp')) {
      const match = style.width.match(/clamp\((\d+)px,\s*(\d+)vw,\s*(\d+)px\)/);
      if (match) {
        const [_, min, vw, max] = match.map(Number);
        const calculated = Math.min(max, Math.max(min, (vw / 100) * targetWidth));
        htmlEl.style.width = `${calculated}px`;
      }
    }
    
    if (style.height && style.height.includes('clamp')) {
      const match = style.height.match(/clamp\((\d+)px,\s*(\d+)(?:vw|vh),\s*(\d+)px\)/);
      if (match) {
        const [_, min, v, max] = match.map(Number);
        const calculated = Math.min(max, Math.max(min, (v / 100) * targetWidth));
        htmlEl.style.height = `${calculated}px`;
      }
    }
  });

  // Clone erstellen (jetzt mit festen Werten!)
  const clone = container.cloneNode(true) as HTMLElement;
  
  // 🔴 Original-Werte wiederherstellen
  originalStyles.forEach((values, el) => {
    const htmlEl = el as HTMLElement;
    if (values.width !== undefined) htmlEl.style.width = values.width;
    if (values.height !== undefined) htmlEl.style.height = values.height;
  });
  
  clone.id = `${containerId}-export-clone`;

  // 🔴 KRITISCH: Wrapper mit fester Größe erstellen
  const wrapper = document.createElement('div');
  wrapper.style.width = `${targetWidth}px`;
  wrapper.style.height = `${targetHeight}px`;
  wrapper.style.position = "absolute";
  wrapper.style.top = "-99999px";
  wrapper.style.left = "-99999px";
  wrapper.style.overflow = "hidden";
  
  // Clone in Wrapper packen
  clone.style.width = "100%";
  clone.style.height = "100%";
  clone.style.position = "relative";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.boxSizing = "border-box";
  clone.style.background = backgroundColor;
  clone.style.pointerEvents = "none";
  
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Warten für Rendering
  await new Promise((r) => setTimeout(r, 150));

  // 🔴 FIX: Alle berechneten Werte (clamp/vw/vh) in feste Pixel umwandeln
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);
    
    // Width fixieren
    if (computed.width && computed.width !== 'auto' && computed.width !== '0px') {
      htmlEl.style.width = computed.width;
    }
    
    // Height fixieren
    if (computed.height && computed.height !== 'auto' && computed.height !== '0px') {
      htmlEl.style.height = computed.height;
    }
    
    // Top/Left/Right/Bottom fixieren
    ['top', 'left', 'right', 'bottom'].forEach(prop => {
      const value = computed[prop as any];
      if (value && value !== 'auto' && value !== '0px') {
        htmlEl.style[prop as any] = value;
      }
    });
  });

  // Warten für Rendering
  await new Promise((r) => setTimeout(r, 150));

  // Screenshot mit scale=1
  const canvas = await html2canvas(wrapper, {
    scale: 1,
    backgroundColor,
    useCORS: true,
    logging: false,
    width: targetWidth,
    height: targetHeight,
    windowWidth: targetWidth,
    windowHeight: targetHeight,
    foreignObjectRendering: false,
  });

  // Cleanup
  document.body.removeChild(wrapper);

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
   EXPORT KONTAKTBOGEN → PDF
   ========================= */

export async function exportKontaktbogenToPDF(
  data: ExportData
): Promise<void> {
  const { geberName, personen, notes, onCleanupDialog } = data;

  const screenshots = Object.entries(SCREENSHOT_KEYS)
    .map(([name, storageKey]) => ({
      name,
      image: sessionStorage.getItem(storageKey),
    }))
    .filter((s) => s.image) as { name: string; image: string }[];

  const hasScreenshots = screenshots.length > 0;

  const doc = new jsPDF({
    orientation: hasScreenshots ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;

  const targetAspectRatio = 16 / 9;
  const pageAspectRatio = pageWidth / pageHeight;

  let pdfWidth: number;
  let pdfHeight: number;

  if (targetAspectRatio > pageAspectRatio) {
    pdfWidth = pageWidth;
    pdfHeight = pageWidth / targetAspectRatio;
  } else {
    pdfHeight = pageHeight;
    pdfWidth = pageHeight * targetAspectRatio;
  }

  const x = (pageWidth - pdfWidth) / 2;
  const y = (pageHeight - pdfHeight) / 2;

  for (let i = 0; i < screenshots.length; i++) {
    const { name, image } = screenshots[i];

    if (i > 0) {
      doc.addPage("a4", "landscape");
    }

    console.log(`📸 ${name}: ${pdfWidth}x${pdfHeight}mm`);

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
  }

  if (hasScreenshots) {
    doc.addPage("a4", "portrait");
  }

  await exportKontaktbogenTextPDF({
    geberName,
    personen,
    notes,
    doc,
  });

  doc.save(`Firmenvorstellung-${geberName}.pdf`);

  if (onCleanupDialog) {
    setTimeout(() => {
      onCleanupDialog(true);
    }, 100);
  }

  Object.values(SCREENSHOT_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });
}