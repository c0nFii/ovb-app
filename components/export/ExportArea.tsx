"use client";

import { ReactNode } from "react";

export default function ExportArea({ children }: { children: ReactNode }) {
  return (
    <div
      id="export-area"
      style={{
        position: "fixed",
        top: 0,
        left: "-10000px",        // komplett außerhalb des Viewports
        width: "794px",          // A4 @ 96dpi (für Text egal, aber stabil)
        pointerEvents: "none",   // kein Einfluss auf UI
        visibility: "hidden",    // nicht sichtbar
      }}
    >
      {children}
    </div>
  );
}
