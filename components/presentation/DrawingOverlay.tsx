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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 76, // ✅ Gleiches Padding wie der Content!
        zIndex: 99999,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}