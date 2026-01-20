"use client";

import TopBar from "@/components/layout/TopBar";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import ExportArea from "@/components/export/ExportArea";
import FlowController from "./FlowController"; // 👈 WICHTIG
import { Path } from "@/components/presentation/DrawingSVG";
import { useRouter } from "next/navigation";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import "@/components/export/export.css";

import { useEffect, useState } from "react";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";

export default function FinanziellerLebensplanPage() {
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const TOPBAR_HEIGHT = 76;

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
    
    // 🔴 A4 Landscape Optimierung
    const image = await exportPageContainerAsImage({
      containerId: "lebensplan-export",
      backgroundColor: "#ffffff",
      quality: 0.85,
    });

    sessionStorage.setItem("lebensplanScreenshot", image);

    router.push("/pages/abs");
  };

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        <div className="lebensplan-export-container" id="lebensplan-export">
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
            paths={drawingPaths}
            setPaths={setDrawingPaths}
           />
          </DrawingOverlay>




          {/* 👇 HIER läuft jetzt der komplette Präsentations‑Flow */}
          <FlowController onComplete={() => setFlowCompleted(true)} />

        </div>
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
