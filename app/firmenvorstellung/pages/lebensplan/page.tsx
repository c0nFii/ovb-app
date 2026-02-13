"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import { useRemoveFromMinimized } from "@/components/layout/useRemoveFromMinimized";
import DrawingSVG, { type Path } from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import FlowController from "./FlowController";
import { useRouter } from "next/navigation";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import "@/components/export/export.css";

const TOPBAR_HEIGHT = 66; // Feste TopBar Höhe (wie EmpfehlungPage)

export default function FinanziellerLebensplanPage() {
  useRemoveFromMinimized();
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("draw");
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
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const image = await exportPageContainerAsImage({
        containerId: "lebensplan-export",
        backgroundColor: "#ffffff",
        quality: 0.85,
      });

      if (typeof image === "string" && image.startsWith("data:image")) {
        sessionStorage.setItem("lebensplanScreenshot", image);
      } else {
        console.warn("Export returned invalid image, skipping sessionStorage set.", image);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }

    router.push("/firmenvorstellung/pages/abs");
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
            id="lebensplan-export"
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

              {/* Präsentations-Flow */}
              <FlowController onComplete={() => setFlowCompleted(true)} />
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
          <button className="werbung-weiter-button" onClick={handleWeiter}>
            Weiter
          </button>
        )}
      </AppScreenWrapper>
    </>
  );
}