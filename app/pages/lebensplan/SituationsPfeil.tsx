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

  // Alle Timer sauber tracken
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
    }, 2400 + 1200); // wipe 3 + text fade

    return clearAllTimers;
  }, [step]);

  /* =========================
     FLOW COMPLETED → exportReady + onDone
     ========================= */

  useEffect(() => {
    if (step < 4) return;

    // Warte kurz, damit die finale "Schnell" Animation starten kann,
    // dann setze exportReady und melde onDone an die Parent-Komponente.
    const t = setTimeout(() => {
      setExportReady(true); // finalen, stabilen Zustand erzwingen (für Export)
      onDone?.();
    }, 1200); // Wartezeit wie vorher (kann angepasst werden)

    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* PRODUKTE */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "calc(1% + clamp(12px, 6vh, 84px) - 15px)",
          transform: "translateX(-45%)",
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: "clamp(130px, 18vw, 260px)",
        }}
      >
        {[leftProducts, rightProducts].map((side, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(12px, 2vh, 20px)",
              alignItems: idx === 0 ? "flex-end" : "flex-start",
            }}
          >
            {side.map((p) => (
              <div
                key={p}
                style={{
                  fontSize: "clamp(18px, 2.2vw, 26px)",
                  fontWeight: 500,
                  color: "#002b5c",
                  opacity: showProducts ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ZIELE-PFEIL + LINIE */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: "clamp(360px, 30vw, 875px)",
          height: "clamp(360px, 30vw, 875px)",
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
              objectFit: "contain",
              clipPath: step > i ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
              transition: "clip-path 1s ease-out",
            }}
          />
        ))}
      </div>

      {/* PROBLEMLINIEN */}
      {[
        {
          text: "Krankheit",
          index: 1,
          startClip: "inset(0% 0% 0% 100%)",
          side: "right",
          textX: "calc(80% + clamp(5px, 4vh, 63px))",
          textY: "68%",
        },
        {
          text: "Unfall",
          index: 2,
          startClip: "inset(0% 100% 0% 0%)",
          side: "left",
          textX: "calc(99% + clamp(30px, 2.5vh, 85px))",
          textY: "45%",
        },
        {
          text: "AMS",
          index: 3,
          startClip: "inset(0% 0% 0% 100%)",
          side: "right",
          textX: "calc(90% + clamp(-20px, 3vh, 120px))",
          textY: "23%",
        },
      ].map((p) =>
        problemStep >= p.index ? (
          <div
            key={p.text}
            style={{
              position: "absolute",
              left: "50%",
              top: "55%",
              transform: "translate(-50%, -50%)",
              width: "clamp(360px, 30vw, 875px)",
              height: "clamp(360px, 30vw, 875px)",
            }}
          >
            <img
              src={`/pictures/problemlinie${p.index === 1 ? "" : p.index}.png`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                clipPath: problemStep === p.index ? p.startClip : "inset(0% 0% 0% 0%)",
                animation: problemStep === p.index ? "wipeIn 1.2s ease-out forwards" : undefined,
              }}
            />

            <div
              style={{
                position: "absolute",
                top: p.textY,
                ...(p.side === "left" ? { left: p.textX } : { right: p.textX }),
                transform: "translate(-50%, -50%)",
                fontSize: "clamp(22px, 2.4vw, 32px)",
                fontWeight: 600,
                color: "#002b5c",
                whiteSpace: "nowrap",
                // Live: erst nach Linie; Export: sofort sichtbar
                opacity: exportReady ? 1 : problemStep >= p.index ? 1 : 0,
                animationName: exportReady ? "none" : "textFadeIn",
                animationDuration: exportReady ? "0s" : "0.3s",
                animationTimingFunction: "ease",
                animationFillMode: "forwards",
                animationDelay: exportReady ? "0s" : "1.2s",
              }}
            >
              {p.text}
            </div>
          </div>
        ) : null
      )}

      {/* ABSCHLUSS */}
      {step >= 4 && (
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "40%",
            color: "#1a8f3c",
            fontSize: "clamp(18px, 2vw, 26px)",
            fontWeight: 600,
          }}
        >
          {["Schnell", "Sicher", "günstig"].map((t, i) => (
            <div
              key={t}
              style={{
                opacity: exportReady ? 1 : 0,
                paddingTop: "clamp(8px, 1.5vh, 12px)",
                animationName: exportReady ? "none" : "fadeIn",
                animationDuration: exportReady ? "0s" : "0.4s",
                animationTimingFunction: "ease",
                animationFillMode: "forwards",
                animationDelay: exportReady ? "0s" : `${i * 0.8}s`,
              }}
            >
              ✔ {t}
            </div>
          ))}
        </div>
      )}

      {/* RING */}
      {showRing && step < 4 && (
        <div
          onClick={() => {
            setStep((s) => s + 1);
          }}
          style={{
            position: "absolute",
            left: "clamp(120px, 22vw, 240px)",
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
        @keyframes textFadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
