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
   DEBUG POPUP
   ========================= */

function showDebugPopup(title: string, debugData: object): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const popup = document.createElement("div");
    popup.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      max-width: 90vw;
      max-height: 80vh;
      overflow: auto;
      font-family: monospace;
      font-size: 14px;
    `;

    const jsonText = JSON.stringify(debugData, null, 2);

    popup.innerHTML = `
      <h3 style="margin-top: 0; color: #333;">${title}</h3>
      <p style="color: #666; font-size: 12px;">Kopiere diesen Text:</p>
      <textarea 
        id="debug-text" 
        readonly 
        style="
          width: 100%;
          height: 250px;
          font-family: monospace;
          font-size: 11px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          resize: none;
        "
      >${jsonText}</textarea>
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button id="copy-btn" style="
          flex: 1;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        ">📋 Kopieren</button>
        <button id="close-btn" style="
          flex: 1;
          padding: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        ">✓ Weiter</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document.getElementById("copy-btn")?.addEventListener("click", () => {
      const textarea = document.getElementById("debug-text") as HTMLTextAreaElement;
      textarea.select();
      document.execCommand("copy");
      const btn = document.getElementById("copy-btn");
      if (btn) btn.textContent = "✓ Kopiert!";
    });

    document.getElementById("close-btn")?.addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve();
    });
  });
}

/* =========================
   EXPORT MIT DEBUG
   ========================= */

export async function exportPageContainerAsImage(
  options: Omit<ExportPageOptions, "fileName">
): Promise<string> {
  const {
    containerId,
    backgroundColor = "#ffffff",
    quality = 0.9,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container not found: ${containerId}`);

  const rect = container.getBoundingClientRect();

  const canvas = await html2canvas(container, {
    backgroundColor,
    useCORS: true,
    logging: false,
    scale: 1,
  });

  const dataUrl = canvas.toDataURL("image/jpeg", quality);

  // Debug Info für Screenshot
  await showDebugPopup("📸 Screenshot erstellt", {
    container: {
      width: rect.width,
      height: rect.height,
      ratio: (rect.width / rect.height).toFixed(4),
    },
    canvas: {
      width: canvas.width,
      height: canvas.height,
      ratio: (canvas.width / canvas.height).toFixed(4),
    },
    dataUrl: {
      length: dataUrl.length,
      startsWithJpeg: dataUrl.startsWith("data:image/jpeg"),
      first100chars: dataUrl.substring(0, 100),
    },
  });

  return dataUrl;
}

/* =========================
   PDF EXPORT MIT DEBUG
   ========================= */

export async function exportKontaktbogenToPDF(
  data: ExportData
): Promise<void> {
  const { geberName, personen, notes, onCleanupDialog } = data;

  // Debug: Was ist im sessionStorage?
  const storageDebug: Record<string, any> = {};
  Object.entries(SCREENSHOT_KEYS).forEach(([name, key]) => {
    const value = sessionStorage.getItem(key);
    storageDebug[name] = {
      key: key,
      exists: value !== null,
      length: value?.length ?? 0,
      startsCorrectly: value?.startsWith("data:image/") ?? false,
    };
  });

  await showDebugPopup("📦 SessionStorage Check", {
    expectedKeys: SCREENSHOT_KEYS,
    found: storageDebug,
  });

  const screenshots = Object.entries(SCREENSHOT_KEYS)
    .map(([name, key]) => ({ name, image: sessionStorage.getItem(key) }))
    .filter((s) => s.image) as { name: string; image: string }[];

  if (screenshots.length === 0) {
    await showDebugPopup("⚠️ Keine Screenshots!", {
      message: "SessionStorage enthält keine Screenshots",
      storage: storageDebug,
    });
    
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await exportKontaktbogenTextPDF({ geberName, personen, notes, doc });
    doc.save(`Firmenvorstellung-${geberName}.pdf`);
    return;
  }

  // Screenshot-Infos sammeln
  const screenshotInfo = await Promise.all(
    screenshots.map(async (s) => {
      const img = await loadImage(s.image);
      return {
        name: s.name,
        width: img.width,
        height: img.height,
        ratio: (img.width / img.height).toFixed(4),
      };
    })
  );

  const firstImg = await loadImage(screenshots[0].image);
  const orientation = firstImg.width > firstImg.height ? "landscape" : "portrait";
  
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = orientation === "landscape" ? 297 : 210;
  const pageHeight = orientation === "landscape" ? 210 : 297;

  const pdfDebugInfo: any[] = [];

  for (let i = 0; i < screenshots.length; i++) {
    if (i > 0) doc.addPage("a4", orientation);

    const img = await loadImage(screenshots[i].image);
    const imgRatio = img.width / img.height;
    const pageRatio = pageWidth / pageHeight;

    let w: number, h: number;
    
    if (imgRatio > pageRatio) {
      w = pageWidth;
      h = pageWidth / imgRatio;
    } else {
      h = pageHeight;
      w = pageHeight * imgRatio;
    }

    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;

    pdfDebugInfo.push({
      page: i + 1,
      name: screenshots[i].name,
      image: { width: img.width, height: img.height, ratio: imgRatio.toFixed(4) },
      pdfPlacement: { w: w.toFixed(2), h: h.toFixed(2), x: x.toFixed(2), y: y.toFixed(2) },
    });

    doc.addImage(screenshots[i].image, "JPEG", x, y, w, h, undefined, "FAST");
  }

  await showDebugPopup("📄 PDF Erstellung", {
    orientation,
    pageSize: { width: pageWidth, height: pageHeight },
    screenshotsUsed: screenshotInfo,
    pdfPages: pdfDebugInfo,
  });

  doc.addPage("a4", "portrait");
  await exportKontaktbogenTextPDF({ geberName, personen, notes, doc });

  doc.save(`Firmenvorstellung-${geberName}.pdf`);

  if (onCleanupDialog) {
    setTimeout(() => onCleanupDialog(true), 100);
  }

  Object.values(SCREENSHOT_KEYS).forEach((key) => sessionStorage.removeItem(key));
}

/* =========================
   DOWNLOAD HELPER
   ========================= */

export async function exportPageContainer(
  options: ExportPageOptions
): Promise<void> {
  const { fileName = "export.jpg", ...rest } = options;
  const dataUrl = await exportPageContainerAsImage(rest);
  
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}