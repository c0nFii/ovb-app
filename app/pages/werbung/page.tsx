"use client";

import { useState } from "react";

import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";

import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import ExportArea from "@/components/export/ExportArea";

export default function WebungsPage() {
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
            backgroundColor: "#ffffff", // 👈 weiße Seite
          }}
        >
          <LaserPointer mode={mode} />

          <ExportArea>
            <DrawingSVG mode={mode} />
          </ExportArea>
        </div>
      </AppScreenWrapper>
    </>
  );
}
