"use client";

import { useEffect, useState, useRef } from "react";
import PulseCircle from "@/components/presentation/PulseCircle";

const leftProducts = ["LV", "Kredit"];
const rightProducts = ["Konto", "Sparbuch"];

export default function ProduktePfeilFlow({ onDone }: { onDone?: () => void }) {
  const [showProducts, setShowProducts] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [step, setStep] = useState(0);
  const [problemStep, setProblemStep] = useState(0);
  const [exportReady, setExportReady] = useState(false);

  const timers = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const clearAllTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // PRODUKTE + erster Ring
  useEffect(() => {
    clearAllTimers();

    addTimer(() => setShowProducts(true), 400);

    // Ring nur in Step 0–2 automatisch anzeigen
    if (step < 3) {
      addTimer(() => setShowRing(true), 1400);
    }

    return clearAllTimers;
  }, [step]);

  // PROBLEMLINIEN
  useEffect(() => {
    if (step !== 3) return;

    clearAllTimers();
    setShowRing(false);
    setProblemStep(0);

    addTimer(() => setProblemStep(1), 0);
    addTimer(() => setProblemStep(2), 1200);
    addTimer(() => setProblemStep(3), 2400);

    // Ring erst nach AMS (3. Linie + Text)
    addTimer(() => {
      setShowRing(true);
    }, 2400 + 1200);

    return clearAllTimers;
  }, [step]);

  // FLOW COMPLETED
  useEffect(() => {
    if (step < 4) return;

    const t = setTimeout(() => {
      setExportReady(true);
      onDone?.();
    }, 1200);

    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      
      {/* ==========================================
          SVG LAYER FÜR ALLE TEXTE
          ========================================== */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <style>{`
            @keyframes svgTextFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes svgFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </defs>

        {/* PRODUKTE LINKS - mit transition wie Original */}
        <text
          x="42%"
          y="82%"
          fill="#002b5c"
          fontSize="clamp(18px, 2.2vw, 26px)"
          fontWeight={500}
          textAnchor="end"
          dominantBaseline="middle"
          style={{
            opacity: showProducts ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          LV
        </text>
        <text
          x="42%"
          y="94%"
          fill="#002b5c"
          fontSize="clamp(18px, 2.2vw, 26px)"
          fontWeight={500}
          textAnchor="end"
          dominantBaseline="middle"
          style={{
            opacity: showProducts ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          Kredit
        </text>

        {/* PRODUKTE RECHTS - mit transition wie Original */}
        <text
          x="58%"
          y="82%"
          fill="#002b5c"
          fontSize="clamp(18px, 2.2vw, 26px)"
          fontWeight={500}
          textAnchor="start"
          dominantBaseline="middle"
          style={{
            opacity: showProducts ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          Konto
        </text>
        <text
          x="58%"
          y="94%"
          fill="#002b5c"
          fontSize="clamp(18px, 2.2vw, 26px)"
          fontWeight={500}
          textAnchor="start"
          dominantBaseline="middle"
          style={{
            opacity: showProducts ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          Sparbuch
        </text>

        {/* KRANKHEIT - Animation wie Original: 1.2s delay, 0.3s duration */}
        {problemStep >= 1 && (
          <text
            x="32%"
            y="65%"
            fill="#002b5c"
            fontSize="clamp(22px, 2.4vw, 32px)"
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              opacity: exportReady ? 1 : 0,
              animation: exportReady ? "none" : "svgTextFadeIn 0.3s ease forwards 1.2s",
            }}
          >
            Krankheit
          </text>
        )}

        {/* UNFALL - Animation wie Original: 1.2s delay, 0.3s duration */}
        {problemStep >= 2 && (
          <text
            x="65%"
            y="50%"
            fill="#002b5c"
            fontSize="clamp(22px, 2.4vw, 32px)"
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              opacity: exportReady ? 1 : 0,
              animation: exportReady ? "none" : "svgTextFadeIn 0.3s ease forwards 1.2s",
            }}
          >
            Unfall
          </text>
        )}

        {/* AMS - Animation wie Original: 1.2s delay, 0.3s duration */}
        {problemStep >= 3 && (
          <text
            x="34.5%"
            y="35%"
            fill="#002b5c"
            fontSize="clamp(22px, 2.4vw, 32px)"
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              opacity: exportReady ? 1 : 0,
              animation: exportReady ? "none" : "svgTextFadeIn 0.3s ease forwards 1.2s",
            }}
          >
            AMS
          </text>
        )}

        {/* SCHNELL - Animation: 0.4s duration, 0s delay */}
        {step >= 4 && (
          <text
            x="80%"
            y="40%"
            fill="#1a8f3c"
            fontSize="clamp(18px, 2vw, 26px)"
            fontWeight={600}
            textAnchor="start"
            dominantBaseline="middle"
            style={{
              opacity: exportReady ? 1 : 0,
              animation: exportReady ? "none" : "svgFadeIn 0.4s ease forwards 0s",
            }}
          >
            ✔ Schnell
          </text>
        )}

        {/* SICHER - Animation: 0.4s duration, 0.8s delay */}
        {step >= 4 && (
          <text
            x="80%"
            y="47%"
            fill="#1a8f3c"
            fontSize="clamp(18px, 2vw, 26px)"
            fontWeight={600}
            textAnchor="start"
            dominantBaseline="middle"
            style={{
              opacity: exportReady ? 1 : 0,
              animation: exportReady ? "none" : "svgFadeIn 0.4s ease forwards 0.8s",
            }}
          >
            ✔ Sicher
          </text>
        )}

        {/* GÜNSTIG - Animation: 0.4s duration, 1.6s delay */}
        {step >= 4 && (
          <text
            x="80%"
            y="54%"
            fill="#1a8f3c"
            fontSize="clamp(18px, 2vw, 26px)"
            fontWeight={600}
            textAnchor="start"
            dominantBaseline="middle"
            style={{
              opacity: exportReady ? 1 : 0,
              animation: exportReady ? "none" : "svgFadeIn 0.4s ease forwards 1.6s",
            }}
          >
            ✔ günstig
          </text>
        )}
      </svg>

      {/* ==========================================
          ZIELE-PFEIL + LINIE
          ========================================== */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          transform: "translate(-50%, -50%)",
          width: "clamp(320px, 23vw, 675px)",
          height: "clamp(320px, 23vw, 675px)",
        }}
      >
        {["zielepfeil", "zielelinie"].map((img, i) => (
          <img
            key={img}
            src={`/pictures/${img}.png`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              maxWidth: "auto%",
              maxHeight: "auto%",
              clipPath: step > i ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
              transition: "clip-path 1s ease-out",
            }}
          />
        ))}
      </div>

      {/* ==========================================
          PROBLEMLINIEN (nur Bilder)
          ========================================== */}
      {[
        {
          index: 1,
          startClip: "inset(0% 0% 0% 100%)",
        },
        {
          index: 2,
          startClip: "inset(0% 100% 0% 0%)",
        },
        {
          index: 3,
          startClip: "inset(0% 0% 0% 100%)",
        },
      ].map((p) =>
        problemStep >= p.index ? (
          <div
            key={p.index}
            style={{
              position: "absolute",
              left: "50%",
              top: "52%",
              transform: "translate(-50%, -50%)",
              width: "clamp(320px, 23vw, 675px)",
              height: "clamp(320px, 23vw, 675px)",
            }}
          >
            <img
              src={`/pictures/problemlinie${p.index === 1 ? "" : p.index}.png`}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "auto%",
                maxHeight: "auto%",
                clipPath: problemStep === p.index ? p.startClip : "inset(0% 0% 0% 0%)",
                animation: problemStep === p.index ? "wipeIn 1.2s ease-out forwards" : undefined,
              }}
            />
          </div>
        ) : null
      )}

      {/* RING */}
      {showRing && step < 4 && (
        <div
          onClick={() => {
            setStep((s) => s + 1);
          }}
          style={{
            position: "absolute",
            left: "clamp(60px, 30vw, 180px)",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <PulseCircle size={110} />
        </div>
      )}

      <style jsx>{`
        @keyframes wipeIn {
          to {
            clip-path: inset(0% 0% 0% 0%);
          }
        }
      `}</style>
    </div>
  );
}