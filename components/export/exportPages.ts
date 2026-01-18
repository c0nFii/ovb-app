"use client";

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
   - robust handling for desktop & tablet
   - dynamic import of html2canvas to avoid SSR issues
   ========================= */

export async function exportPageContainerAsImage(
  options: Omit<ExportPageOptions, "fileName">
): Promise<string> {
  // Dynamically import html2canvas so this module works with SSR/Turbopack
  const { default: html2canvas } = await import("html2canvas");

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
  const elementsToFix = container.querySelectorAll("*");
  const originalStyles = new Map<Element, { width?: string; height?: string }>();

  elementsToFix.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.style;

    // Original-Werte speichern
    originalStyles.set(el, {
      width: style.width,
      height: style.height,
    });

    // clamp(min, vw, max) bei targetWidth berechnen (einfache Erkennung)
    if (style.width && style.width.includes("clamp")) {
      const match = style.width.match(/clamp\((\d+)px,\s*([\d.]+)vw,\s*(\d+)px\)/);
      if (match) {
        const min = Number(match[1]);
        const vw = Number(match[2]);
        const max = Number(match[3]);
        const calculated = Math.min(max, Math.max(min, (vw / 100) * targetWidth));
        htmlEl.style.width = `${calculated}px`;
      }
    }

    if (style.height && style.height.includes("clamp")) {
      const match = style.height.match(/clamp\((\d+)px,\s*([\d.]+)(vw|vh),\s*(\d+)px\)/);
      if (match) {
        const min = Number(match[1]);
        const v = Number(match[2]);
        const max = Number(match[4]);
        // Use targetWidth as reference for vw; for vh you'd need viewport height — this is a pragmatic approach
        const calculated = Math.min(max, Math.max(min, (v / 100) * targetWidth));
        htmlEl.style.height = `${calculated}px`;
      }
    }
  });

  // Clone erstellen (jetzt mit festen Werten!)
  const clone = container.cloneNode(true) as HTMLElement;

  // 🔴 Original-Werte wiederherstellen IM ORIGINAL
  originalStyles.forEach((values, el) => {
    const htmlEl = el as HTMLElement;
    if (values.width !== undefined) htmlEl.style.width = values.width;
    if (values.height !== undefined) htmlEl.style.height = values.height;
  });

  clone.id = `${containerId}-export-clone`;

  // 🔴 KRITISCH: Wrapper mit fester Größe erstellen
  const wrapper = document.createElement("div");
  wrapper.style.width = `${targetWidth}px`;
  wrapper.style.height = `${targetHeight}px`;
  wrapper.style.position = "absolute";
  wrapper.style.top = "-99999px";
  wrapper.style.left = "-99999px";
  wrapper.style.overflow = "hidden";
  wrapper.style.background = backgroundColor;
  wrapper.style.boxSizing = "border-box";

  // Clone bekommt EXAKT die gleiche Größe
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.position = "relative";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.boxSizing = "border-box";
  clone.style.pointerEvents = "none";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Warten für Rendering
  await new Promise((r) => setTimeout(r, 50));

  // 🔴 JETZT im DOM: Fixiere alle nested container sizes

  // 🔴 FIX: Entferne paddingTop vom Clone (nur für Export!) — falls vorhanden
  const innerDiv = clone.querySelector('[style*="paddingTop"]') as HTMLElement;
  if (innerDiv) {
    innerDiv.style.paddingTop = "0";
  }

  const cloneElements = clone.querySelectorAll("*");
  cloneElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);

    // Force inline styles für alle computed sizes (nur wenn sinnvoll)
    if (!htmlEl.style.width && computed.width && computed.width !== "auto") {
      const width = parseFloat(computed.width);
      if (width > 0 && width < 10000) {
        htmlEl.style.width = computed.width;
      }
    }

    if (!htmlEl.style.height && computed.height && computed.height !== "auto") {
      const height = parseFloat(computed.height);
      if (height > 0 && height < 10000) {
        htmlEl.style.height = computed.height;
      }
    }
  });

  // 🔴 FIX: SVG viewBox auf Export-Größe anpassen (uniform scaling)
  const svgTargetHeight = targetHeight; // z. B. 1080px

  const debugLogs: string[] = [];

  // 🔍 DEBUG: Check ALL elements with inline styles
  const allStyledElements = clone.querySelectorAll("[style]");
  debugLogs.push(`Total styled elements: ${allStyledElements.length}\n`);

  // Find elements that LOOK like image containers (have width and height)
  const potentialContainers: any[] = [];
  allStyledElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);

    if (htmlEl.tagName === "DIV" && computed.width && computed.height) {
      const width = parseFloat(computed.width);
      const height = parseFloat(computed.height);

      if (width > 200 && width < 2000 && height > 100 && height < 2000) {
        potentialContainers.push({
          tag: htmlEl.tagName,
          styleWidth: htmlEl.style.width,
          styleHeight: htmlEl.style.height,
          computedWidth: computed.width,
          computedHeight: computed.height,
          position: computed.position,
          top: computed.top,
          left: computed.left,
        });
      }
    }
  });

  debugLogs.push(`Potential image containers: ${potentialContainers.length}\n`);
  potentialContainers.forEach((c, idx) => {
    debugLogs.push(`Container ${idx + 1}:`);
    debugLogs.push(`  Style W/H: ${c.styleWidth} / ${c.styleHeight}`);
    debugLogs.push(`  Computed W/H: ${c.computedWidth} / ${c.computedHeight}`);
    debugLogs.push(`  Position: ${c.position} (${c.top}, ${c.left})\n`);
  });

  const svgs = clone.querySelectorAll("svg[viewBox]");
  debugLogs.push(`\nFound ${svgs.length} SVG elements\n`);

  svgs.forEach((svg, idx) => {
    const htmlSvg = svg as SVGSVGElement;
    const currentViewBox = htmlSvg.getAttribute("viewBox");

    debugLogs.push(`\nSVG ${idx + 1}:`);
    debugLogs.push(`  viewBox: ${currentViewBox}`);

    if (currentViewBox) {
      const [vbX, vbY, vbW, vbH] = currentViewBox.split(" ").map(Number);

      const scaleX = targetWidth / vbW;
      const scaleY = svgTargetHeight / vbH;
      const uniformScale = Math.min(scaleX, scaleY);

      debugLogs.push(`  Current: ${vbW}x${vbH}`);
      debugLogs.push(`  Target: ${targetWidth}x${svgTargetHeight}`);
      debugLogs.push(`  Scale X/Y: ${scaleX.toFixed(3)}x, ${scaleY.toFixed(3)}y`);
      debugLogs.push(`  Uniform Scale: ${uniformScale.toFixed(3)} (using minimum)`);

      // Set viewBox to export size so svg scales to wrapper
      htmlSvg.setAttribute("viewBox", `0 0 ${targetWidth} ${svgTargetHeight}`);

      // Scale path coordinates uniformly (best-effort)
      const paths = htmlSvg.querySelectorAll("path");
      debugLogs.push(`  Paths found: ${paths.length}`);

      paths.forEach((path, pIdx) => {
        const d = path.getAttribute("d");
        if (d) {
          // Log first move coordinates if present
          const firstCoords = d.match(/M\s*([\d.]+)\s+([\d.]+)/);
          if (firstCoords) {
            const oldX = parseFloat(firstCoords[1]);
            const oldY = parseFloat(firstCoords[2]);
            const newX = oldX * uniformScale;
            const newY = oldY * uniformScale;
            debugLogs.push(
              `    Path ${pIdx + 1}: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) → (${newX.toFixed(
                1
              )}, ${newY.toFixed(1)})`
            );
          }

          // Replace M/L coordinates with scaled values (simple regex; may not cover all path commands)
          const scaledD = d.replace(/([ML])\s*([\d.]+)\s+([\d.]+)/g, (match, cmd, x, y) => {
            const newX = parseFloat(x) * uniformScale;
            const newY = parseFloat(y) * uniformScale;
            return `${cmd} ${newX.toFixed(2)} ${newY.toFixed(2)}`;
          });
          path.setAttribute("d", scaledD);
        }
      });
    }
  });

  // 🔍 DEBUG: Zeige Logs
  if (debugLogs.length > 0) {
    const debugDiv = document.createElement("div");
    debugDiv.style.position = "fixed";
    debugDiv.style.top = "50%";
    debugDiv.style.left = "50%";
    debugDiv.style.transform = "translate(-50%, -50%)";
    debugDiv.style.background = "rgba(0,0,0,0.95)";
    debugDiv.style.color = "lime";
    debugDiv.style.padding = "30px";
    debugDiv.style.zIndex = "9999999";
    debugDiv.style.fontSize = "14px";
    debugDiv.style.fontFamily = "monospace";
    debugDiv.style.maxWidth = "90vw";
    debugDiv.style.maxHeight = "90vh";
    debugDiv.style.overflow = "auto";
    debugDiv.style.borderRadius = "8px";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close & Continue";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    closeBtn.style.padding = "8px 16px";
    closeBtn.style.background = "#00ff00";
    closeBtn.style.color = "black";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontWeight = "bold";

    const textarea = document.createElement("textarea");
    textarea.value = debugLogs.join("\n");
    textarea.readOnly = false;
    textarea.style.width = "100%";
    textarea.style.minHeight = "400px";
    textarea.style.background = "#1a1a1a";
    textarea.style.color = "lime";
    textarea.style.border = "2px solid lime";
    textarea.style.padding = "15px";
    textarea.style.fontSize = "13px";
    textarea.style.fontFamily = "monospace";
    textarea.style.borderRadius = "4px";
    textarea.style.marginTop = "10px";

    debugDiv.appendChild(closeBtn);
    debugDiv.appendChild(textarea);
    document.body.appendChild(debugDiv);

    textarea.focus();
    textarea.select();

    // Warte auf Close-Click
    await new Promise<void>((resolve) => {
      closeBtn.onclick = () => {
        document.body.removeChild(debugDiv);
        resolve();
      };
    });
  }

  // Warten für Rendering
  await new Promise((r) => setTimeout(r, 150));

  // 🔴 FIX: Alle berechneten Werte (clamp/vw/vh) in feste Pixel umwandeln
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);

    // Width fixieren
    if (computed.width && computed.width !== "auto" && computed.width !== "0px") {
      htmlEl.style.width = computed.width;
    }

    // Height fixieren
    if (computed.height && computed.height !== "auto" && computed.height !== "0px") {
      htmlEl.style.height = computed.height;
    }

    // Top/Left/Right/Bottom fixieren
    ["top", "left", "right", "bottom"].forEach((prop) => {
      const value = (computed as any)[prop];
      if (value && value !== "auto" && value !== "0px") {
        try {
          (htmlEl.style as any)[prop] = value;
        } catch {}
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
  try {
    document.body.removeChild(wrapper);
  } catch {}

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
   EXPORT KONTAKBOGEN → PDF
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

    doc.addImage(image!, "JPEG", x, y, pdfWidth, pdfHeight, undefined, "FAST");
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
