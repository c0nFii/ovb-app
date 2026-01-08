"use client";

import TopBar from "@/components/layout/TopBar";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import ExportArea from "@/components/export/ExportArea";
import FlowController from "./FlowController"; // 👈 WICHTIG
import { Path } from "@/components/presentation/DrawingSVG";

import { useState } from "react";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";

export default function FinanziellerLebensplanPage() {
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const TOPBAR_HEIGHT = 76;

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        <div
          style={{
            position: "absolute",
            top: TOPBAR_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <LaserPointer mode={mode} />

          <DrawingOverlay active={mode === "draw" || mode === "erase"}>
  <DrawingSVG
    active={mode === "draw" || mode === "erase"}
    erase={mode === "erase"}
    paths={drawingPaths}
    setPaths={setDrawingPaths}
  />
</DrawingOverlay>




          {/* 👇 HIER läuft jetzt der komplette Präsentations‑Flow */}
          <FlowController />
        </div>
      </AppScreenWrapper>
    </>
  );
}
