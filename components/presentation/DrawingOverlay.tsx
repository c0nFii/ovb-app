"use client";

import { ReactNode } from "react";

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
        inset: 0,
        zIndex: 99999,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
