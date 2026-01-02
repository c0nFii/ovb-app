"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import EmpfehlungFlow from "./EmpfehlungFlow"; // dein Flow von vorher

export default function EmpfehlungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
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
