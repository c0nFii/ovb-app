import html2canvas from "html2canvas";

/* =========================
   TYPES
   ========================= */

export type ExportPageOptions = {
  containerId: string;
  fileName?: string;
  backgroundColor?: string;
  quality?: number;
  targetWidth?: number; // 👈 NEU: Ziel-Breite
  targetHeight?: number; // 👈 NEU: Ziel-Höhe
};

/* =========================
   PAGE EXPORT (DOWNLOAD)
   ========================= */

export async function exportPageContainer(
  options: ExportPageOptions
): Promise<void> {
  const {
    containerId,
    fileName = "export.png",
    backgroundColor = "#ffffff",
    quality = 0.8,
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
    quality = 0.8,
    targetWidth = 1920,
    targetHeight = 1080,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Export container not found: ${containerId}`);

  // 1) Clone the container (deep)
  const clone = container.cloneNode(true) as HTMLElement;
  

  // 2) Apply fixed export size to the clone and reset transforms
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.position = "absolute";
  clone.style.top = "-99999px";
  clone.style.left = "-99999px";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxSizing = "border-box";
  clone.style.background = backgroundColor;

  // 3) Append clone to body so html2canvas can render it
  document.body.appendChild(clone);

  // 4) Wait a tick so fonts/images/rendering settle
  await new Promise((r) => setTimeout(r, 50));

  // 5) Compute scale for crispness (use devicePixelRatio or custom)
  const deviceScale = window.devicePixelRatio || 1;
  const canvas = await html2canvas(clone, {
    scale: deviceScale, // quality multiplier
    backgroundColor,
    useCORS: true,
    logging: false,
    width: targetWidth,
    height: targetHeight,
    windowWidth: targetWidth,
    windowHeight: targetHeight,
    foreignObjectRendering: false,
  });

  // 6) Cleanup clone
  document.body.removeChild(clone);

  // 7) Return JPEG data URL
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