"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import PulseCircle from "@/components/presentation/PulseCircle";
import EmpfehlungFlow from "./EmpfehlungFlow";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import { Path } from "@/components/presentation/DrawingSVG";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import { useRouter } from "next/navigation";

export default function EmpfehlungPage() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<"normal" | "draw" | "erase" | "laser">("normal");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [showWeiterButton, setShowWeiterButton] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const [contentArea, setContentArea] = useState({ top: 0, height: 0, ready: false });

  const router = useRouter();

  /* =========================
     CONTENT-BEREICH MESSEN
     ========================= */

  useLayoutEffect(() => {
    const measure = () => {
      if (wrapperRef.current && topBarRef.current) {
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const topBarRect = topBarRef.current.getBoundingClientRect();
        
        // Content beginnt direkt nach TopBar
        const topBarBottom = topBarRect.bottom - wrapperRect.top;
        const availableHeight = wrapperRect.height - topBarBottom;
        
        setContentArea({
          top: topBarBottom,
          height: availableHeight,
          ready: true,
        });
        
        console.log("📐 Gemessen:", { 
          wrapperHeight: wrapperRect.height,
          topBarBottom,
          availableHeight 
        });
      }
    };

    // Initial + verzögert für Safe-Area
    measure();
    setTimeout(measure, 100);
    setTimeout(measure, 300);

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
    router.push("/pages/kontaktbogen");
  };

  const isDrawingActive = mode === "draw" || mode === "erase";

  return (
    <AppScreenWrapper>
      {/* Wrapper für Messungen */}
      <div 
        ref={wrapperRef} 
        style={{ 
          position: "absolute", 
          inset: 0,
          overflow: "hidden",
        }}
      >
        {/* TopBar mit Ref */}
        <div ref={topBarRef}>
          <TopBar mode={mode} setMode={setMode} />
        </div>

        {/* Export Container - nur rendern wenn gemessen */}
        {contentArea.ready && (
          <div 
            id="empfehlung-export"
            style={{
              position: "absolute",
              top: contentArea.top,
              left: 0,
              width: "100%",
              height: contentArea.height,
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
                <EmpfehlungFlow 
                  containerHeight={contentArea.height}
                  onComplete={() => setFlowCompleted(true)}
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
      </div>
    </AppScreenWrapper>
  );
}