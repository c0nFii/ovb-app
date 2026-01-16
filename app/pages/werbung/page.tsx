"use client";

import { useState, useEffect } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import GrundSkel from "./grundskel";
import WerbungFlow from "./werbung";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import { Path } from "@/components/presentation/DrawingSVG";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import "@/components/export/export.css";
import { useRouter } from "next/navigation";

export default function WerbungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const [showWerbung, setShowWerbung] = useState(false);

  const [flowCompleted, setFlowCompleted] = useState(false);
  const [showWeiterButton, setShowWeiterButton] = useState(false);

  const router = useRouter();

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
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const image = await exportPageContainerAsImage({
      containerId: "werbung-export",
      backgroundColor: "#ffffff",
      quality: 0.85,
      targetWidth: 1920,  // 🔴 Zielgröße für A4
      targetHeight: 1080, // 🔴 16:9 Format
    });

    sessionStorage.setItem("werbungScreenshot", image);

    router.push("/pages/empfehlung");
  };


  /* =========================
     RENDER
     ========================= */

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        <div className="werbung-export-container" id="werbung-export">
          <LaserPointer mode={mode} />

          <DrawingOverlay active={mode === "draw" || mode === "erase"}>
            <DrawingSVG
              active={mode === "draw" || mode === "erase"}
              erase={mode === "erase"}
              paths={drawingPaths}
              setPaths={setDrawingPaths}
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

          {showWerbung && (
            <WerbungFlow
              mode={mode}
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