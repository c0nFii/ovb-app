"use client";

import { useState, useEffect, useLayoutEffect } from "react";

import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";

import PulseCircle from "@/components/presentation/PulseCircle";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import { Path } from "@/components/presentation/DrawingSVG";
import { exportPageContainerAsImage } from "@/components/export/exportPages";
import { useRouter } from "next/navigation";

const TOPBAR_HEIGHT = 76;

export default function KapitalmarktPage() {
  const [started, setStarted] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const [showNextTrigger, setShowNextTrigger] = useState(true);

  // OVB Hint Ablauf
  const [showLeftTrigger, setShowLeftTrigger] = useState(false);
  const [showRightTrigger, setShowRightTrigger] = useState(false);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(false);

  // Für Export
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [showWeiterButton, setShowWeiterButton] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const router = useRouter();

  const images = [
    "bank.png",
    "vers.png",
    "bsk.png",
    "invest.png",
    "immo.png",
    "staat.png",
    "v.png",
    "ovb.png",
  ];

  const isLastImage = imageIndex === images.length - 1;
  const isDrawingActive = mode === "draw" || mode === "erase";

  // Bildbereich: 85% der Container-Höhe, max 900px
  const imageHeight = Math.min(contentHeight * 0.85, 900);
  // Breite proportional (Bilder sind ca. 16:9)
  const imageWidth = imageHeight * 1.6;

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

  const handleNext = () => {
    if (imageIndex < images.length - 1) {
      setShowNextTrigger(false);
      setImageIndex((i) => i + 1);
      setTimeout(() => setShowNextTrigger(true), 2000);
    }
  };

  // Nach letztem Bild: 2 Sekunden → linker Trigger
  useEffect(() => {
    if (!isLastImage) return;

    setShowLeftTrigger(false);
    setShowRightTrigger(false);
    setShowLeftHint(false);
    setShowRightHint(false);

    const t = setTimeout(() => {
      setShowLeftTrigger(true);
    }, 2000);

    return () => clearTimeout(t);
  }, [isLastImage]);

  // Klick links → Hint + 2 Sekunden → rechter Trigger
  const handleLeftTriggerClick = () => {
    setShowLeftTrigger(false);
    setShowLeftHint(true);

    setTimeout(() => {
      setShowRightTrigger(true);
    }, 2000);
  };

  // Klick rechts → Flow completed
  const handleRightTriggerClick = () => {
    setShowRightHint(true);
    setFlowCompleted(true);
  };

  // Button Delay
  useEffect(() => {
    if (!flowCompleted) return;
    const t = setTimeout(() => setShowWeiterButton(true), 2000);
    return () => clearTimeout(t);
  }, [flowCompleted]);

  // Export + Navigation
  const handleWeiter = async () => {
    setShowWeiterButton(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const image = await exportPageContainerAsImage({
        containerId: "kapitalmarkt-export",
        backgroundColor: "#ffffff",
        quality: 0.85,
      });
      sessionStorage.setItem("kapitalmarktScreenshot", image);
    } catch (error) {
      console.error("Export failed:", error);
    }
    router.push("/pages/lebensplan");
  };

  return (
    <>
      {/* TopBar AUSSERHALB - immer klickbar */}
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        {/* Export Container - beginnt unter TopBar */}
        {contentHeight > 0 && (
          <div
            id="kapitalmarkt-export"
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

              {/* Start PulseCircle */}
              {!started && (
                <PulseCircle
                  onClick={() => {
                    setStarted(true);
                    setShowNextTrigger(false);
                    setTimeout(() => setShowNextTrigger(true), 2000);
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 100,
                  }}
                />
              )}

              {/* Bildbereich - zentriert mit fester Größe */}
              {started && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: imageWidth,
                    height: imageHeight,
                    maxWidth: "95%",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {images.slice(0, imageIndex + 1).map((img, i) => {
                    const isCurrentImage = i === imageIndex;
                    const isOVB = img === "ovb.png";

                    return (
                      <img
                        key={img}
                        src={`/${img}`}
                        alt=""
                        style={{
                          position: "absolute",
                          maxWidth: "120%",
                          maxHeight: "120%",
                          width: "auto",
                          height: "auto",
                          zIndex: i,
                          // Reveal Animation nur für aktuelles Bild
                          clipPath: isCurrentImage ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
                          animation: isCurrentImage 
                            ? (isOVB ? "revealLeft 1.2s ease-out forwards" : "fadeIn 0.8s ease-out forwards")
                            : "none",
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* OVB Hints als SVG - stabiler Export */}
              {started && isLastImage && (
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 200,
                  }}
                >
                  {/* Linker Hint Text */}
                  {showLeftHint && (
                    <text
                      x="8%"
                      y="12%"
                      fontSize="28"
                      fill="#003879"
                      fontFamily="Arial, sans-serif"
                      fontWeight="500"
                      style={{ opacity: 0, animation: "svgFadeIn 0.8s ease-out forwards" }}
                    >
                      Kein eigenes Produkt
                    </text>
                  )}

                  {/* Rechter Hint Text */}
                  {showRightHint && (
                    <text
                      x="95%"
                      y="80%"
                      fontSize="28"
                      fill="#003879"
                      fontFamily="Arial, sans-serif"
                      fontWeight="500"
                      textAnchor="end"
                      style={{ opacity: 0, animation: "svgFadeIn 0.8s ease-out forwards" }}
                    >
                      ✔ Seit 2006 TÜV geprüft
                    </text>
                  )}
                </svg>
              )}

              {/* Trigger Icons - bleiben als divs (werden nicht exportiert wenn nicht sichtbar) */}
              {started && isLastImage && (
                <>
                  {showLeftTrigger && !showLeftHint && (
                    <div
                      onClick={handleLeftTriggerClick}
                      className="pulse-icon"
                      style={{
                        position: "absolute",
                        left: "8%",
                        top: "8%",
                        fontSize: "48px",
                        color: "#003879",
                        cursor: "pointer",
                        zIndex: 300,
                        pointerEvents: "auto",
                      }}
                    >
                      ⚠️
                    </div>
                  )}

                  {showRightTrigger && !showRightHint && (
                    <div
                      onClick={handleRightTriggerClick}
                      className="pulse-icon"
                      style={{
                        position: "absolute",
                        right: "8%",
                        bottom: "8%",
                        fontSize: "48px",
                        color: "#003879",
                        cursor: "pointer",
                        zIndex: 300,
                        pointerEvents: "auto",
                      }}
                    >
                      ⚠️
                    </div>
                  )}
                </>
              )}

              {/* Next PulseCircle */}
              {started && showNextTrigger && imageIndex < images.length - 1 && (
                <PulseCircle
                  onClick={handleNext}
                  style={{
                    position: "absolute",
                    inset: 0,
                    scale: 0.85,
                    margin: "auto",
                    zIndex: 100,
                    pointerEvents: "auto",
                  }}
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

      {/* Einfache Animationen - KEIN blur */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }
        
        @keyframes revealLeft {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }
        
        @keyframes svgFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}