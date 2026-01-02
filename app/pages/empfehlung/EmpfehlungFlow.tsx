"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PulseCircle from "@/components/presentation/PulseCircle";

export default function EmpfehlungFlow() {
  const [step, setStep] = useState(0);
  const [showRing, setShowRing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRing(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);


  const sequence = [
    "kfz.png",
    "kfzpfeil.png",
    "hausetw.png",
    "etwpfeil.png",
    "35.png",
    "steuern.png",
    "steuerpfeil.png",
    "strich.png", // 🔥 finaler Schritt
  ];

  const lastRingStep = sequence.length - 2; // Ring darf bei steuerpfeil noch erscheinen

  const handleClick = () => {
    setShowRing(false);

    // Bild sofort anzeigen
    setStep(s => s + 1);

    // Ring nur zurückbringen, wenn wir NICHT beim letzten Bild sind
    if (step < lastRingStep) {
      setTimeout(() => {
        setShowRing(true);
      }, 2000); // 🔥 2 Sekunden Pause
    }
  };

  const wipeStyle = (isNew: boolean): React.CSSProperties => ({
    objectFit: "contain",
    position: "absolute",
    inset: 0,
    clipPath: isNew ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
    animation: isNew ? "wipeIn 2s ease forwards" : "none",
  });

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
              <Image
                src={`/pictures/${img}`}
                alt=""
                fill
                style={wipeStyle(step === i)}
              />
            </div>
          ) : null
        )}
      </div>

      {/* Klickbarer Ring */}
      {showRing && step <= lastRingStep && (
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

      {/* Wipe Animation */}
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
