"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import EmpfehlungFlow from "./EmpfehlungFlow";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import LaserPointer from "@/components/presentation/LaserPointer";
import { Path } from "@/components/presentation/DrawingSVG";
export default function EmpfehlungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
{/* 🔥 LASER MUSS GANZ OBEN SEIN */}
        <LaserPointer mode={mode} />

        {/* ===== DRAWING LAYER (SVG) ===== */}
        <DrawingOverlay active={mode === "draw" || mode === "erase"}>
  <DrawingSVG
    active={mode === "draw" || mode === "erase"}
    erase={mode === "erase"}
    paths={drawingPaths}
    setPaths={setDrawingPaths}
  />
</DrawingOverlay>



        {/* ===== STARTKREIS ===== */}
        {!started && (
          <PulseCircle
            onClick={() => setStarted(true)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
              pointerEvents: "auto",
            }}
          />
        )}

        {/* ===== FLOW ===== */}
        {started && <EmpfehlungFlow />}
      </AppScreenWrapper>
    </>
  );
}
