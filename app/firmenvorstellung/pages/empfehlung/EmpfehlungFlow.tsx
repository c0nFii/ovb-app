"use client";

import { useState, useEffect } from "react";
import PulseCircle from "@/components/presentation/PulseCircle";

type EmpfehlungFlowProps = {
  containerHeight: number;
  onComplete?: () => void;
};

export default function EmpfehlungFlow({ containerHeight, onComplete }: EmpfehlungFlowProps) {
  const [step, setStep] = useState(0);
  const [showRing, setShowRing] = useState(false);

  const sequence = [
    "kfz.png",
    "kfzpfeil.png",
    "hausetw.png",
    "etwpfeil.png",
    "35.png",
    "steuern.png",
    "steuerpfeil.png",
    "strich.png",
  ];

  const lastStep = sequence.length - 1;

  useEffect(() => {
    if (step >= lastStep) return;

    const timer = setTimeout(() => {
      setShowRing(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [step, lastStep]);

  const handleClick = () => {
    if (step >= lastStep) return;
    setShowRing(false);
    setStep((s) => s + 1);
  };

  useEffect(() => {
    if (step === lastStep) {
      onComplete?.();
    }
  }, [step, lastStep, onComplete]);

  // Bildbereich: 80% der Container-Höhe, max 800px
  const imageHeight = Math.min(containerHeight * 0.8, 800);
  // Breite proportional zur Höhe basierend auf Bild-Ratio (2318/1180 ≈ 1.96)
  const imageWidth = imageHeight * 1.96;

  return (
    <>
      {/* Bildbereich - zentriert */}
      <div
        style={{
          position: "absolute",
          top: "45%",
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
        {sequence.map((img, i) =>
          step >= i ? (
            <img
              key={img}
              src={`/pictures/${img}`}
              alt=""
              style={{
                position: "absolute",
                // KEINE width/height 100%! Stattdessen max-width/max-height
                maxWidth: "90%",
                maxHeight: "90%",
                // Automatische Größe, behält Ratio
                width: "auto",
                height: "auto",
                clipPath: step === i ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
                animation: step === i ? "wipeIn 2s ease forwards" : "none",
              }}
            />
          ) : null
        )}

        {/* wichtig.png - separat */}
        {step === lastStep && (
          <img
            src="/pictures/wichtig.png"
            alt="Wichtig"
            style={{
              position: "absolute",
              maxWidth: "90%",
              maxHeight: "90%",
              top: "-5%",
              width: "auto",
              height: "auto",
              marginTop: imageHeight * 0.27, // 13.5% * 2 ≈ 27% offset
              clipPath: "inset(0 100% 0 0)",
              animation: "wipeIn 2s ease forwards",
            }}
          />
        )}
      </div>



      {/* Ring */}
      {showRing && step < lastStep && (
        <PulseCircle
          onClick={handleClick}
          style={{
            position: "absolute",
            top: "75%",
            left: "20%",
            scale: 0.7,
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            pointerEvents: "auto",
          }}
        />
      )}

      <style jsx>{`
        @keyframes wipeIn {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }
      `}</style>
    </>
  );
}