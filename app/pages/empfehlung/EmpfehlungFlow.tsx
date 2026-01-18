"use client";

import { useState, useEffect } from "react";
import PulseCircle from "@/components/presentation/PulseCircle";

type EmpfehlungFlowProps = {
  onComplete?: () => void;
};

export default function EmpfehlungFlow({ onComplete }: EmpfehlungFlowProps) {
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

  // Ring nach 2 Sekunden (nur solange wir nicht beim letzten Bild sind)
  useEffect(() => {
    if (step >= lastStep) return;

    const timer = setTimeout(() => {
      setShowRing(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [step, lastStep]);

  const handleClick = () => {
    if (step >= lastStep) return; // 🔒 Nach letztem Bild nichts mehr tun

    setShowRing(false);
    setStep((s) => s + 1);
  };

  // 🔴 SOFORT fertig, wenn letztes Bild erreicht ist
  useEffect(() => {
    if (step === lastStep) {
      onComplete?.();
    }
  }, [step, lastStep, onComplete]);

  return (
    <>
      {/* Bildbereich */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(300px, 60vw, 1400px)",
          height: "clamp(200px, 40vw, 1400px)",
          pointerEvents: "none",
        }}
      >
        {sequence.map((img, i) =>
          step >= i ? (
            <div key={img} style={{ position: "absolute", inset: 0 }}>
              {/* Normales Bild */}
              <img
                src={`/pictures/${img}`}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  clipPath: step === i ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
                  animation: step === i ? "wipeIn 2s ease forwards" : "none",
                }}
              />

              {/* wichtig.png – exakt gleiches Verhalten beim letzten Bild */}
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

      {/* Ring nur bis VOR dem letzten Bild */}
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

      {/* Animation */}
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
