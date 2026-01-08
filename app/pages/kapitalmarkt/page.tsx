"use client";

import { useState, useEffect } from "react";

import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";

import PulseCircle from "@/components/presentation/PulseCircle";
import ImageSequence from "@/components/presentation/ImageSequence";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import { Path } from "@/components/presentation/DrawingSVG";
import ExportArea from "@/components/export/ExportArea";
import OVBHints from "@/components/presentation/OVBHints";

export default function KapitalmarktPage() {
  const [started, setStarted] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");
const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);
  const [showNextTrigger, setShowNextTrigger] = useState(true);

  // 🔥 OVB Hint Ablauf
  const [showLeftTrigger, setShowLeftTrigger] = useState(false);
  const [showRightTrigger, setShowRightTrigger] = useState(false);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(false);

  const TOPBAR_HEIGHT = 76;

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

  const handleNext = () => {
    if (imageIndex < images.length - 1) {
      setShowNextTrigger(false);
      setImageIndex((i) => i + 1);
      setTimeout(() => setShowNextTrigger(true), 2000);
    }
  };

  const isLastImage = imageIndex === images.length - 1;

  // 🔥 Nach letztem Bild: 2 Sekunden → linker Trigger
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

  // 🔥 Klick links → Hint + 2 Sekunden → rechter Trigger
  const handleLeftTriggerClick = () => {
    setShowLeftTrigger(false);
    setShowLeftHint(true);

    setTimeout(() => {
      setShowRightTrigger(true);
    }, 2000);
  };

  return (
    <>
      <TopBar mode={mode} setMode={setMode} />

      <AppScreenWrapper>
        <div
          style={{
            position: "absolute",
            top: TOPBAR_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* 🔥 LIVE‑EBENE */}
          <LaserPointer mode={mode} />

          {started && (
            <ImageSequence images={images} imageIndex={imageIndex} />
          )}

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

          {started && (
            <>
              <DrawingOverlay active={mode === "draw" || mode === "erase"}>
  <DrawingSVG
    active={mode === "draw" || mode === "erase"}
    erase={mode === "erase"}
    paths={drawingPaths}
    setPaths={setDrawingPaths}
  />
</DrawingOverlay>




              {/* 🔥 OVB‑HINTS – NUR BEIM LETZTEN BILD */}
              {isLastImage && (
                <>
                  {/* ⚠️ LINKS – pulsierend */}
                  {showLeftTrigger && !showLeftHint && (
  <div
    onClick={handleLeftTriggerClick}
    className="pulse-icon"
    style={{
      position: "absolute",
      left: "clamp(40px, 8vw, 120px)",
      top: "clamp(20px, 10vw, 160px)",
      fontSize: "clamp(32px, 5vw, 48px)",
      color: "#002b5c",
      cursor: "pointer",
      zIndex: 100,
    }}
  >
    ⚠️
  </div>
)}


                  {/* ⚠️ RECHTS – pulsierend */}
                  {showRightTrigger && !showRightHint && (
  <div
    onClick={() => setShowRightHint(true)}
    className="pulse-icon"
    style={{
      position: "absolute",
      right: "clamp(40px, 8vw, 120px)",
      bottom: "clamp(60px, 10vw, 160px)",
      fontSize: "clamp(32px, 5vw, 48px)",
      color: "#002b5c",
      cursor: "pointer",
      zIndex: 100,
    }}
  >
    ⚠️
  </div>
)}


                  {showLeftHint && <OVBHints side="left" />}
                  {showRightHint && <OVBHints side="right" />}
                </>
              )}

              {showNextTrigger && imageIndex < images.length - 1 && (
                <PulseCircle
                  onClick={handleNext}
                  style={{
                    position: "absolute",
                    inset: 0,
                    margin: "auto",
                    zIndex: 100,
                  }}
                />
              )}
            </>
          )}
        </div>
      </AppScreenWrapper>
    </>
  );
}
