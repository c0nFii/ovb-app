"use client";

import html2canvas from "html2canvas";

/**
 * Wait until all <img> inside container are loaded and have naturalWidth > 0.
 */
async function ensureImagesLoaded(container: HTMLElement, timeout = 3000) {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (imgs.length === 0) return;

  const promises = imgs.map((img) => {
    return new Promise<void>((resolve, reject) => {
      if (img.complete && img.naturalWidth && img.naturalWidth > 0) {
        return resolve();
      }

      try {
        const src = img.getAttribute("src") || "";
        if (!src.startsWith("data:") && /^https?:\/\//.test(src)) {
          if (!img.crossOrigin) img.crossOrigin = "anonymous";
        }
      } catch {
        // ignore
      }

      const onLoad = () => {
        cleanup();
        if (img.naturalWidth && img.naturalWidth > 0) resolve();
        else reject(new Error("Image loaded but has zero naturalWidth"));
      };
      const onError = (ev: any) => {
        cleanup();
        reject(new Error("Image failed to load: " + (img.src || "unknown")));
      };
      const cleanup = () => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onError);
      };

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);

      setTimeout(() => {
        cleanup();
        if (img.complete && img.naturalWidth && img.naturalWidth > 0) resolve();
        else reject(new Error("Image load timeout: " + (img.src || "unknown")));
      }, timeout);
    });
  });

  await Promise.all(promises);
}

/* =========================
   TYPES
   ========================= */

export type ExportPageOptions = {
  containerId: string;
  fileName?: string;
  backgroundColor?: string;
  quality?: number;
};

/* =========================
   EXPORT
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
  if (rect.width === 0 || rect.height === 0) {
    throw new Error(`Container has zero size: ${containerId} (${rect.width}x${rect.height})`);
  }

  try {
    await ensureImagesLoaded(container, 4000);
  } catch (e) {
    throw new Error("Not all images loaded inside container: " + (e as Error).message);
  }

  // Kurz warten damit alle Animationen/Transitions abgeschlossen sind
  await new Promise(resolve => setTimeout(resolve, 50));

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(container, {
      backgroundColor,
      useCORS: true,
      logging: false,
      // WICHTIG: scale: 1 für konsistentes Text-Rendering
      // devicePixelRatio kann zu Sub-Pixel-Verschiebungen führen
      scale: 1,
      // Runde auf ganze Pixel um Sub-Pixel-Probleme zu vermeiden
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      // foreignObjectRendering kann bei manchen Fonts helfen
      foreignObjectRendering: false,
    });
  } catch (e) {
    throw new Error("html2canvas failed: " + (e as Error).message);
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("html2canvas produced an empty canvas");
  }

  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  } catch (e) {
    throw new Error("canvas.toDataURL failed (possible tainted canvas / CORS): " + (e as Error).message);
  }

  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    throw new Error("Invalid data URL produced by canvas: " + String(dataUrl).slice(0, 80));
  }

  return dataUrl;
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