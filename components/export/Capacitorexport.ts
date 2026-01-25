import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Prüft ob wir auf einer nativen Plattform (iOS/Android) laufen
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Speichert base64 PDF im Filesystem und teilt es
 * @param base64Data - PDF als base64 string (mit oder ohne data:application/pdf;base64, prefix)
 * @param fileName - Dateiname z.B. "Firmenvorstellung-Max-Mustermann.pdf"
 */
export async function saveAndSharePDF(
  base64Data: string,
  fileName: string
): Promise<void> {
  if (!isNativePlatform()) {
    // Fallback für Web: normaler Download
    downloadPDFInBrowser(base64Data, fileName);
    return;
  }

  try {
    // Base64 prefix entfernen falls vorhanden
    const base64 = base64Data.replace(/^data:application\/pdf;base64,/, '');

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

/**
 * Fallback für Browser: normaler Download
 */
function downloadPDFInBrowser(base64Data: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = fileName;
  link.click();
}