"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import GrundSkel from "./grundskel";
import WerbungFlow from "./werbung";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";

export default function WerbungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");

  const [showWerbung, setShowWerbung] = useState(false);

  const handleFinish = () => {
    setShowWerbung(true);
  };

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>

        {/* 🔥 EINZIGES globales SVG */}
        <LaserPointer mode={mode} />

        <DrawingOverlay active={mode === "draw" || mode === "erase"}>
          <DrawingSVG
            active={mode === "draw" || mode === "erase"}
            erase={mode === "erase"}
          />
        </DrawingOverlay>

        {!started && (
          <PulseCircle
            onClick={() => setStarted(true)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
            }}
          />
        )}

        {started && (
          <GrundSkel
            mode={mode}
            start={true}
            onFinish={handleFinish}
          />
        )}

        {showWerbung && <WerbungFlow mode={mode} />}

      </AppScreenWrapper>
    </>
  );
}
