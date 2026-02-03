"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import GrundSkel from "./grundskel";
import WerbungFlow from "./werbung";
import DrawingSVG, { type Path } from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import "@/components/export/export.css";
import { useRouter } from "next/navigation";

const TOPBAR_HEIGHT = 66; // Feste TopBar Höhe (wie EmpfehlungPage)

export default function WerbungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("draw");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const [showWerbung, setShowWerbung] = useState(false);

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
     FLOW START
     ========================= */

  const handleFinish = () => {
    setShowWerbung(true);
  };

  /* =========================
     BUTTON DELAY (2 SEK)
     ========================= */

  useEffect(() => {
    if (!flowCompleted) return;

    const t = setTimeout(() => {
      setShowWeiterButton(true);
    }, 2000);

    return () => clearTimeout(t);
  }, [flowCompleted]);

  /* =========================
     WEITER → EXPORT + NAV
     ========================= */

  const handleWeiter = async () => {
    setShowWeiterButton(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const image = await exportPageContainerAsImage({
        containerId: "werbung-export",
        backgroundColor: "#ffffff",
        quality: 0.85,
      });
      sessionStorage.setItem("werbungScreenshot", image);
    } catch (error) {
      console.error("Export failed:", error);
    }
    
    router.push("/pages/empfehlung");
  };

  const isDrawingActive = mode !== "laser"; // Zeichnen aktiv außer im Laser-Modus

  /* =========================
     RENDER
     ========================= */

  return (
    <>
      {/* TopBar AUSSERHALB - immer klickbar */}
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        {/* Export Container - beginnt unter TopBar */}
        {contentHeight > 0 && (
          <div 
            id="werbung-export"
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
                    zIndex: 50,
                    pointerEvents: "auto",
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

              {showWerbung && (
                <WerbungFlow
                  mode={mode}
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