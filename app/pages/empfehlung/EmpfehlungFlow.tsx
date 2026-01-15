"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PulseCircle from "@/components/presentation/PulseCircle";

type EmpfehlungFlowProps = {
  onComplete?: () => void; // 👈 NEU
};

export default function EmpfehlungFlow({ onComplete }: EmpfehlungFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [showRing, setShowRing] = useState(false);
  const [showWichtigButton, setShowWichtigButton] = useState(false);

  // Ring nach 2 Sekunden
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRing(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 🔥 WICHTIG: wichtig.png NICHT in der sequence
  const sequence = [
    "kfz.png",
    "kfzpfeil.png",
    "hausetw.png",
    "etwpfeil.png",
    "35.png",
    "steuern.png",
    "steuerpfeil.png",
    "strich.png", // letzter normales Bild
  ];

  const lastRingStep = sequence.length - 1;

  const handleClick = () => {
    setShowRing(false);
    setStep((s) => s + 1);

    if (step < lastRingStep) {
      setTimeout(() => {
        setShowRing(true);
      }, 2000);
    }
  };

  // wichtig.png → nach 2s pulsieren + onComplete
  useEffect(() => {
    if (step === sequence.length) {
      const t = setTimeout(() => {
        setShowWichtigButton(true);
        onComplete?.(); // 👈 NEU: Flow fertig!
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [step, onComplete]);

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

      {/* Normaler Ring */}
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

      {/* WICHTIG.png als Info (kein Click mehr) */}
      {step === sequence.length && (
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(300px, 60vw, 1400px)",
            height: "clamp(200px, 40vw, 1400px)",
            zIndex: 99999,
            pointerEvents: "none", // 👈 kein Click mehr
          }}
        >
          <Image
            src="/pictures/wichtig.png"
            alt="Wichtig"
            fill
            style={{
              objectFit: "contain",
              clipPath: showWichtigButton
                ? "inset(0 0 0 0)"
                : "inset(0 100% 0 0)",
              animation: showWichtigButton
                ? "none"
                : "wipeIn 2s ease forwards",
            }}
          />
        </div>
      )}

      {/* Animationen */}
      <style jsx>{`
        @keyframes wipeIn {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.02);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}