"use client";

import html2canvas from "html2canvas";

/**
 * Wait until all <img> inside container are loaded and have naturalWidth > 0.
 * Tries to set crossOrigin="anonymous" for non-data URLs to help html2canvas.
 */
async function ensureImagesLoaded(container: HTMLElement, timeout = 3000) {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (imgs.length === 0) return;

  const promises = imgs.map((img) => {
    return new Promise<void>((resolve, reject) => {
      // If already loaded and valid
      if (img.complete && img.naturalWidth && img.naturalWidth > 0) {
        return resolve();
      }

      // Try to set crossOrigin if it's an http(s) URL and not a data URL
      try {
        const src = img.getAttribute("src") || "";
        if (!src.startsWith("data:") && /^https?:\/\//.test(src)) {
          // Only set if not already set
          if (!img.crossOrigin) img.crossOrigin = "anonymous";
        }
      } catch {
        // ignore
      }

      const onLoad = () => {
        cleanup();
        // naturalWidth check to avoid 0×0 images
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

      // Fallback timeout
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

  // Ensure container is visible and has size
  const rect = container.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new Error(`Container has zero size: ${containerId} (${rect.width}x${rect.height})`);
  }

  // Wait for images inside container to be loaded (helps avoid data:, and tainted canvas)
  try {
    await ensureImagesLoaded(container, 4000);
  } catch (e) {
    // Provide a clear error so caller can react (re-capture etc.)
    throw new Error("Not all images loaded inside container: " + (e as Error).message);
  }

  // html2canvas options: useCORS true helps when crossOrigin is set on images
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(container, {
      backgroundColor,
      useCORS: true,
      logging: false,
      scale: Math.max(1, window.devicePixelRatio || 1),
    });
  } catch (e) {
    throw new Error("html2canvas failed: " + (e as Error).message);
  }

  // Validate canvas
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("html2canvas produced an empty canvas");
  }

  // Convert to data URL and validate
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
