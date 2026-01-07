"use client";

import TopBar from "@/components/layout/TopBar";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import ExportArea from "@/components/export/ExportArea";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";

import FlowController from "./FlowController";
import AnalyseErklärung from "./AnalyseErklaerung";
import BeratungErklärung from "./BeratungErklaerung";
import ServiceErklärung from "./ServiceErklaerung"; // 👈 NEU

import { useState } from "react";

export default function ABSPage() {
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");

  const [showAnalyse, setShowAnalyse] = useState(false);
  const [showBeratung, setShowBeratung] = useState(false);
  const [showService, setShowService] = useState(false); // 👈 NEU

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
  />
</DrawingOverlay>


          {/* STEP 1 – FlowController */}
          {!showAnalyse && !showBeratung && !showService && (
            <FlowController onDone={() => setShowAnalyse(true)} />
          )}

          {/* STEP 2 – AnalyseErklärung */}
          {showAnalyse && !showBeratung && !showService && (
            <AnalyseErklärung onDone={() => setShowBeratung(true)} />
          )}

          {/* STEP 3 – BeratungErklärung */}
          {showBeratung && !showService && (
            <BeratungErklärung onDone={() => setShowService(true)} />
          )}

          {/* STEP 4 – ServiceErklärung */}
          {showService && <ServiceErklärung />}
        </div>
      </AppScreenWrapper>
    </>
  );
}
