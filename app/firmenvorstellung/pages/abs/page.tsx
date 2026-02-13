"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import { useRemoveFromMinimized } from "@/components/layout/useRemoveFromMinimized";
import DrawingSVG, { type Path } from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import FlowController from "./FlowController";
import AnalyseErklaerung from "./AnalyseErklaerung";
import BeratungErklaerung from "./BeratungErklaerung";
import ServiceErklaerung from "./ServiceErklaerung";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import { useRouter } from "next/navigation";

const TOPBAR_HEIGHT = 76;

export default function ABSPage() {
  useRemoveFromMinimized();
  const [mode, setMode] = useState<"normal" | "draw" | "erase" | "laser">("draw");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  
  // Phasen
  const [showAnalyse, setShowAnalyse] = useState(false);
  const [showBeratung, setShowBeratung] = useState(false);
  const [showService, setShowService] = useState(false);
  
  // Weiter Button
  const [showWeiterButton, setShowWeiterButton] = useState(false);
  
  // Content Höhe
  const [contentHeight, setContentHeight] = useState(0);

  const router = useRouter();

  const isDrawingActive = mode !== "laser"; // Zeichnen aktiv außer im Laser-Modus

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
     SCREENSHOT FUNKTIONEN
     ========================= */

  const takeScreenshot = async (name: string) => {
    try {
      const image = await exportPageContainerAsImage({
        containerId: "abs-export",
        backgroundColor: "#ffffff",
        quality: 0.85,
      });
      sessionStorage.setItem(name, image);
    } catch (error) {
      console.error(`Screenshot ${name} failed:`, error);
    }
  };

  /* =========================
     PHASE WECHSEL HANDLER
     ========================= */

  // Phase 1 → Phase 2 (FlowController → Analyse)
  const handleFlowDone = () => {
    setShowAnalyse(true);
  };

  // Phase 2 → Phase 3 (Analyse → Beratung)
  // Wird beim 2. Klick auf bhalb aufgerufen
  const handleAnalyseDone = async () => {
    // Screenshot 1 (mit Zeichnung + Hint)
    await takeScreenshot("absScreenshot1");
    
    // Zeichnung löschen
    setDrawingPaths([]);
    
    // Nächste Phase
    setShowBeratung(true);
  };

  // Phase 3 → Phase 4 (Beratung → Service)
  const handleBeratungDone = async () => {
    // Screenshot 2 (mit Zeichnung)
    await takeScreenshot("absScreenshot2");
    
    // Zeichnung löschen
    setDrawingPaths([]);
    
    // Nächste Phase
    setShowService(true);
  };

  // Phase 4 fertig → Weiter Button zeigen
  const handleServiceDone = () => {
    setTimeout(() => setShowWeiterButton(true), 2000);
  };

  // Weiter Button → Screenshot 3 + Navigation
  const handleWeiter = async () => {
    setShowWeiterButton(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Screenshot 3 (mit Zeichnung)
    await takeScreenshot("absScreenshot3");
    
    // Navigation zur nächsten Seite
    router.push("/firmenvorstellung/pages/werbung"); 
  };

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        {contentHeight > 0 && (
          <div
            id="abs-export"
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

              {/* STEP 1 – FlowController */}
              {!showAnalyse && !showBeratung && !showService && (
                <FlowController onDone={handleFlowDone} />
              )}

              {/* STEP 2 – AnalyseErklärung */}
              {showAnalyse && !showBeratung && !showService && (
                <AnalyseErklaerung 
                  containerHeight={contentHeight}
                  onDone={handleAnalyseDone} 
                />
              )}

              {/* STEP 3 – BeratungErklärung */}
              {showBeratung && !showService && (
                <BeratungErklaerung 
                  containerHeight={contentHeight}
                  onDone={handleBeratungDone} 
                />
              )}

              {/* STEP 4 – ServiceErklärung */}
              {showService && (
                <ServiceErklaerung 
                  containerHeight={contentHeight}
                  onDone={handleServiceDone} 
                />
              )}
            </div>

            {/* Drawing Layer */}
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