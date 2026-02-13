"use client";

import { useState, useEffect } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import { useRemoveFromMinimized } from "@/components/layout/useRemoveFromMinimized";
import DrawingSVG, { type Path } from "@/components/presentation/DrawingSVG";
import ChancenblattFlow from "./ChancenblattFlow";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import LaserPointer from "@/components/presentation/LaserPointer";

const OVB_BLUE = "#013F72";

export default function ChancenblattPage() {
  useRemoveFromMinimized();
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("draw");
const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
<LaserPointer mode={mode} />

        <DrawingOverlay active={mode !== "laser"}>
  <DrawingSVG
    active={mode !== "laser"}
    erase={mode === "erase"}
    paths={drawingPaths}
    setPaths={setDrawingPaths}
  />
</DrawingOverlay>


        {!started && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "600px",
              textAlign: "center",
              color: OVB_BLUE,
              zIndex: 50,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(22px, 2.4vw, 24px)",
                marginBottom: "16px",
                fontWeight: 700,
              }}
            >
              Zusammenarbeit beginnt mit gemeinsamen Werten
            </h2>

            <p
              style={{
                fontSize: "clamp(18px, 1.6vw, 20px)",
                lineHeight: 1.5,
                marginBottom: "28px",
              }}
            >
              Unsere Arbeitsweise basiert auf klaren Prinzipien und einem bewährten System.
Die nächsten kurzen Fragen geben Ihnen einen Einblick, wie wir denken und arbeiten – und ob das zu Ihren Vorstellungen passt.
            </p>

            <button
              onClick={() => setStarted(true)}
              style={{
                background: OVB_BLUE,
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "12px 26px",
                fontSize: "clamp(14px, 1.8vw, 16px)",
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            >
              Jetzt ansehen
            </button>
          </div>
        )}

        {started && <ChancenblattFlow />}
      </AppScreenWrapper>
    </>
  );
}
