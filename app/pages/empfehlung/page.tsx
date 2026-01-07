"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import EmpfehlungFlow from "./EmpfehlungFlow";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import LaserPointer from "@/components/presentation/LaserPointer";

export default function EmpfehlungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");

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
