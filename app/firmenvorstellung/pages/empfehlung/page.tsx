"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import { useRemoveFromMinimized } from "@/components/layout/useRemoveFromMinimized";
import PulseCircle from "@/components/presentation/PulseCircle";
import EmpfehlungFlow from "./EmpfehlungFlow";
import DrawingSVG, { type Path } from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import { useRouter } from "next/navigation";

const TOPBAR_HEIGHT = 66; // Feste TopBar Höhe (50px Icon + 8px padding oben/unten)

export default function EmpfehlungPage() {
  useRemoveFromMinimized();
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<"normal" | "draw" | "erase" | "laser">("draw");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [showWeiterButton, setShowWeiterButton] = useState(false);
  
  const [contentHeight, setContentHeight] = useState(0);

  const router = useRouter();

  /* =========================
     CONTENT-HÖHE BERECHNEN
     ========================= */

  useLayoutEffect(() => {
    const measure = () => {
      const availableHeight = window.innerHeight - TOPBAR_HEIGHT;
      setContentHeight(availableHeight);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", () => setTimeout(measure, 200));

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* =========================
     BUTTON DELAY
     ========================= */

  useEffect(() => {
    if (!flowCompleted) return;
    const t = setTimeout(() => setShowWeiterButton(true), 2000);
    return () => clearTimeout(t);
  }, [flowCompleted]);

  /* =========================
     EXPORT + NAV
     ========================= */

  const handleWeiter = async () => {
    setShowWeiterButton(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const image = await exportPageContainerAsImage({
        containerId: "empfehlung-export",
        backgroundColor: "#ffffff",
        quality: 0.85,
      });
      sessionStorage.setItem("empfehlungScreenshot", image);
    } catch (error) {
      console.error("Export failed:", error);
    }
    router.push("/firmenvorstellung/pages/kontaktbogen");
  };

  const isDrawingActive = mode !== "laser"; // Zeichnen aktiv außer im Laser-Modus

  return (
    <>
      {/* TopBar AUSSERHALB - immer klickbar */}
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        {/* Export Container - beginnt unter TopBar */}
        {contentHeight > 0 && (
          <div 
            id="empfehlung-export"
            style={{
              position: "absolute",
              top: TOPBAR_HEIGHT,
              left: 0,
              width: "100vw",
              height: contentHeight,
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            {/* Content Layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
              }}
            >
              <LaserPointer mode={mode} />

              {!started && (
                <PulseCircle
                  onClick={() => setStarted(true)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 9999,
                    pointerEvents: "auto",
                  }}
                />
              )}

              {started && (
                <EmpfehlungFlow 
                  containerHeight={contentHeight}
                  onComplete={() => setFlowCompleted(true)}
                />
              )}
            </div>

            {/* Drawing Layer - z-index unter TopBar */}
            <DrawingSVG
              active={isDrawingActive}
              erase={mode === "erase"}
              paths={drawingPaths}
              setPaths={setDrawingPaths}
            />
          </div>
        )}

        {/* Weiter Button */}
        {showWeiterButton && (
          <button
            className="werbung-weiter-button"
            onClick={handleWeiter}
          >
            Weiter
          </button>
        )}
      </AppScreenWrapper>
    </>
  );
}