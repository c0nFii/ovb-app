"use client";

import { ReactNode } from "react";

/**
 * DrawingOverlay - Container für Drawing-Elemente
 *
 * HINWEIS: Diese Komponente ist optional.
 * Die DrawingSVG-Komponente kann auch direkt verwendet werden,
 * da sie ihre eigenen pointer-events basierend auf dem `active` Prop steuert.
 */
export default function DrawingOverlay({
  children,
  active,
}: {
  children: ReactNode;
  active: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 100, // Unter TopBar (9999), über Content
        pointerEvents: "none", // Durchlässig für Maus/Touch → Buttons/Ringe klickbar
      }}
    >
      {children}
    </div>
  );
}
