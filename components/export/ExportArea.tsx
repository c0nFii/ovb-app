"use client";

import { ReactNode } from "react";

export default function ExportArea({ children }: { children: ReactNode }) {
  return (
    <div
      id="export-area"
      style={{
        position: "relative",
        width: 2560,
        height: 1440,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
