"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function EasyPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Verbindung fehlgeschlagen — Seite nicht erreichbar.");
      }
    }, 7000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleOpenExternal = () => {
    window.open("https://easy.ovb.at/", "_blank", "noopener,noreferrer");
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Reload iframe by resetting src
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={iframeRef}
        src="https://easy.ovb.at/"
        title="OVB Easy"
        onLoad={handleLoad}
        className="w-full h-full border-0"
      />

      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => router.back()}
          className="text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded"
          aria-label="Schließen"
        >
          ×
        </button>

        <button
          onClick={handleOpenExternal}
          className="text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded"
        >
          Extern öffnen
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Lade OVB Easy…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 p-4">
          <div className="mb-3 text-center">{error}</div>
          <div className="flex gap-2">
            <button onClick={handleOpenExternal} className="bg-white text-[#12324e] px-3 py-1 rounded">
              Extern öffnen
            </button>
            <button onClick={handleRetry} className="bg-white/10 text-white px-3 py-1 rounded">
              Erneut versuchen
            </button>
            <button onClick={() => router.back()} className="bg-white/10 text-white px-3 py-1 rounded">
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
