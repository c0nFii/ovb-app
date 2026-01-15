import html2canvas from "html2canvas";

/* =========================
   TYPES
   ========================= */

export type ExportPageOptions = {
  containerId: string;
  fileName?: string;
  pixelRatio?: number;
  backgroundColor?: string;
  quality?: number; // 👈 NEU
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
    pixelRatio = 2,
    backgroundColor = "#ffffff",
    quality = 0.8, // 👈 NEU
  } = options;

  const dataUrl = await exportPageContainerAsImage({
    containerId,
    pixelRatio,
    backgroundColor,
    quality,
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
    pixelRatio = 1, // 👈 REDUZIERT von 2 auf 1.5
    backgroundColor = "#ffffff",
    quality = 0.8, // 👈 NEU: JPEG Qualität
  } = options;

  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Export container not found: ${containerId}`);
  }

  const canvas = await html2canvas(container, {
    scale: pixelRatio,
    backgroundColor,
    useCORS: true,
    logging: false,
  });

  // 👇 JPEG statt PNG (viel kleiner!)
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