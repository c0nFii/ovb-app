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

  const imageAreaHeight = Math.min(containerHeight * 0.55, 800);

  return (
    <>
      {/* Bildbereich */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(300px, 70vw, 1400px)",
          height: imageAreaHeight,
          pointerEvents: "none",
        }}
      >
        {sequence.map((img, i) =>
          step >= i ? (
            <div key={img} style={{ position: "absolute", inset: 0 }}>
              <img
                src={`/pictures/${img}`}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center center",
                  clipPath: step === i ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
                  animation: step === i ? "wipeIn 2s ease forwards" : "none",
                }}
              />

              {/* wichtig.png - Original Position */}
              {i === lastStep && step === lastStep && (
                <img
                  src="/pictures/wichtig.png"
                  alt="Wichtig"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    top: 115,
                    objectFit: "contain",
                    clipPath: "inset(0 100% 0 0)",
                    animation: "wipeIn 2s ease forwards",
                  }}
                />
              )}
            </div>
          ) : null
        )}
      </div>

      {/* Ring */}
      {showRing && step < lastStep && (
        <PulseCircle
          onClick={handleClick}
          style={{
            position: "absolute",
            top: "80%",
            left: "20%",
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