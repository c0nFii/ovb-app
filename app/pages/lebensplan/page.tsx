"use client";

import TopBar from "@/components/layout/TopBar";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import ExportArea from "@/components/export/ExportArea";
import FlowController from "./FlowController"; // 👈 WICHTIG

import { useState } from "react";

export default function FinanziellerLebensplanPage() {
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");

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

          <ExportArea>
            <DrawingSVG mode={mode} />
          </ExportArea>

          {/* 👇 HIER läuft jetzt der komplette Präsentations‑Flow */}
          <FlowController />
        </div>
      </AppScreenWrapper>
    </>
  );
}
