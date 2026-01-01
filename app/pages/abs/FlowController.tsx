"use client";

import { useState, useEffect } from "react";
import PulseCircle from "@/components/presentation/PulseCircle";

export default function FlowController({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(0);

  // Pfeil-Visibility + Pfeil-Reveal getrennt (für echtes Wipe-In)
  const [arrowAVisible, setArrowAVisible] = useState(false);
  const [arrowARevealed, setArrowARevealed] = useState(false);

  const [arrowBVisible, setArrowBVisible] = useState(false);
  const [arrowBRevealed, setArrowBRevealed] = useState(false);

  const [arrowSVisible, setArrowSVisible] = useState(false);
  const [arrowSRevealed, setArrowSRevealed] = useState(false);

  const [blinkA, setBlinkA] = useState(false);

  useEffect(() => {
    if (step === 1) {
      // A fährt hoch
      setTimeout(() => setStep(2), 200);

      // Pfeil A
      setTimeout(() => setArrowAVisible(true), 1500);
      setTimeout(() => setArrowARevealed(true), 1800);

      // Pfeil B
      setTimeout(() => setArrowBVisible(true), 2300);
      setTimeout(() => setArrowBRevealed(true), 2600);

      // Pfeil S
      setTimeout(() => setArrowSVisible(true), 3100);
      setTimeout(() => setArrowSRevealed(true), 3400);

      // Blinken erst wenn ALLES fertig ist
      setTimeout(() => setBlinkA(true), 4000);
    }
  }, [step]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* STEP 0 – PULSIERENDER STARTKREIS */}
      {step === 0 && (
        <div
          onClick={() => setStep(1)}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        >
          <PulseCircle size={120} />
        </div>
      )}

      {/* STEP >= 1 – ÜBERSCHRIFT */}
      {step >= 1 && (
        <div
          style={{
            position: "absolute",
            top: "clamp(40px, 8vh, 100px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: 700,
            color: "#002b5c",
            textAlign: "center",
          }}
        >
          A.B.S. System
        </div>
      )}

      {/* STEP >= 1 – KREIS‑ANORDNUNG */}
      {step >= 1 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(280px, 40vw, 480px)",
            height: "clamp(280px, 40vw, 480px)",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* A – SLIDE IN + BLINK */}
            <img
              src="/pictures/a.png"
              onClick={() => blinkA && onDone?.()}
              style={{
                position: "absolute",
                left: "50%",
                top: step === 1 ? "60%" : "20%",
                transform: "translate(-50%, -50%)",
                width: "clamp(80px, 12vw, 140px)",
                transition: "top 1.3s ease",

                pointerEvents: blinkA ? "auto" : "none",
                cursor: blinkA ? "pointer" : "default",

                animation: blinkA
                  ? "blinkA 1.1s ease-in-out infinite"
                  : "none",
              }}
            />

            {/* B */}
            <img
              src="/pictures/b.png"
              style={{
                position: "absolute",
                right: "-20%",
                top: "85%",
                transform: "translateY(-50%)",
                width: "clamp(80px, 12vw, 140px)",
              }}
            />

            {/* S */}
            <img
              src="/pictures/s.png"
              style={{
                position: "absolute",
                left: "-20%",
                top: "85%",
                transform: "translateY(-50%)",
                width: "clamp(80px, 12vw, 140px)",
              }}
            />

            {/* PFEIL A – Wipe von oben nach unten */}
            {arrowAVisible && (
              <img
                src="/pictures/pfeila.png"
                style={{
                  position: "absolute",
                  left: "60%",
                  top: "20%",
                  width: "clamp(100px, 40vw, 240px)",
                  height: "clamp(100px, 40vw, 240px)",
                  objectFit: "contain",
                  pointerEvents: "none",
                  transform: "rotate(15deg)",

                  clipPath: arrowARevealed
                    ? "inset(0 0 0 0)"
                    : "inset(0 0 100% 0)",

                  transition: "clip-path 1.5s ease",
                }}
              />
            )}

            {/* PFEIL B – Wipe von rechts nach links */}
            {arrowBVisible && (
              <img
                src="/pictures/pfeilb.png"
                style={{
                  position: "absolute",
                  left: "25%",
                  top: "60%",
                  width: "clamp(100px, 40vw, 240px)",
                  height: "clamp(100px, 40vw, 240px)",
                  objectFit: "contain",
                  pointerEvents: "none",
                  transform: "rotate(55deg)",

                  clipPath: arrowBRevealed
                    ? "inset(0 0 0 0)"
                    : "inset(0 0 0 100%)",

                  transition: "clip-path 1.5s ease",
                }}
              />
            )}

            {/* PFEIL S – Wipe von unten nach oben */}
            {arrowSVisible && (
              <img
                src="/pictures/pfeils.png"
                style={{
                  position: "absolute",
                  right: "60%",
                  top: "20%",
                  width: "clamp(100px, 40vw, 240px)",
                  height: "clamp(100px, 40vw, 240px)",
                  objectFit: "contain",
                  pointerEvents: "none",
                  transform: "rotate(85deg)",

                  clipPath: arrowSRevealed
                    ? "inset(0 0 0 0)"
                    : "inset(100% 0 0 0)",

                  transition: "clip-path 1.5s ease",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* CSS ANIMATIONEN */}
      <style jsx>{`
        @keyframes blinkA {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
