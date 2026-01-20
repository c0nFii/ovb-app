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
        zIndex: 9999,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
