"use client";

import { useState, useEffect } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import EmpfehlungFlow from "./EmpfehlungFlow";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import LaserPointer from "@/components/presentation/LaserPointer";
import { Path } from "@/components/presentation/DrawingSVG";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import "@/components/export/export.css";
import { useRouter } from "next/navigation";

export default function EmpfehlungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  
  // 🔥 NEU: Flow Completion + Button
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [showWeiterButton, setShowWeiterButton] = useState(false);

  const router = useRouter();

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
    // 👇 Button verstecken
    setShowWeiterButton(false);
    
    // 👇 Kurz warten, damit React rendern kann
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const image = await exportPageContainerAsImage({
      containerId: "empfehlung-export",
      pixelRatio: 1.5,
    });

    sessionStorage.setItem("empfehlungScreenshot", image);

    router.push("/pages/kontaktbogen");
  };

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        <div className="werbung-export-container" id="empfehlung-export">
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
          {started && (
            <EmpfehlungFlow 
              onComplete={() => setFlowCompleted(true)}
            />
          )}
        </div>

        {/* 👇 Button AUSSERHALB des Export-Containers */}
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