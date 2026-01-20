"use client";

import { useEffect, useRef, useState } from "react";
import PulseCircle from "@/components/presentation/PulseCircle";

const images = [
  "/pictures/haus.png",
  "/pictures/auto.png",
  "/pictures/familie.png",
  "/pictures/strand.png",
];

export default function ZieleFlow({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(0);
  const [showRing, setShowRing] = useState(true);
  const [showSituation, setShowSituation] = useState(false);
  const [afterSituation, setAfterSituation] = useState(false);

  const [visibleImages, setVisibleImages] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  };

  const [finalRing, setFinalRing] = useState(false);

  const handleClick = () => {
    if (finalRing) {
      setShowRing(false);
      onDone?.();
      return;
    }

    // ============================
    // SEQUENZIELLES BILDER-EINBLENDEN
    // ============================
    if (step === 0) {
      setShowRing(false);

      const delays = [0, 1000, 2000, 3000]; // 1s Abstand

      delays.forEach((delay, index) => {
        schedule(() => {
          setVisibleImages((prev) => {
            const copy = [...prev];
            copy[index] = true;
            return copy;
          });
        }, delay);
      });

      // Ring erst nach allen Bildern
      schedule(() => {
        setShowRing(true);
      }, 4000);

      setStep(1);
      return;
    }

    // ============================
    // SITUATION-PHASE
    // ============================
    if (step === 1 && !showSituation) {
      setShowSituation(true);
      setShowRing(false);

      schedule(() => {
        setShowRing(true);
        setFinalRing(true);
      }, 1500);

      setStep(2);
      return;
    }
  };

  // ============================
  // LAYOUT-WERTE
  // ============================
  const contentMaxWidth = "clamp(760px, 78vw, 1120px)";
  const sidePadding = "clamp(0px, 1.5vw, 12px)";
  const imageW = "clamp(100px, 16vw, 150px)";
  const gap = "clamp(12px, 1.6vw, 18px)";
  const lift = "translateY(clamp(-40px, -1.2vh, -40px))";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* HAUPTÜBERSCHRIFT */}
      <div
        style={{
          fontSize: "clamp(20px, 2.5vw, 32px)",
          fontWeight: 600,
          color: "#002b5c",
          marginBottom: "clamp(16px, 3vh, 36px)",
        }}
      >
        Finanzieller Lebensweg
      </div>

      {/* ZIELE + BILDER */}
      <div
        style={{
          width: "100%",
          maxWidth: contentMaxWidth,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "flex-start",
          columnGap: "clamp(16px, 2.2vw, 28px)",
          opacity: step >= 1 ? 1 : 0,
          pointerEvents: step >= 1 ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        {/* LINKS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap,
            paddingLeft: sidePadding,
            paddingRight: "clamp(24px, 4vw, 64px)",
            transform: lift,
          }}
        >
          {/* HAUS */}
          <div style={{ width: imageW }}>
            <img
              src={images[0]}
              alt="Haus"
              style={{
                width: "100%",
                opacity: visibleImages[0] ? 1 : 0,
                animation: visibleImages[0]
                  ? "zielFade 0.6s ease-out forwards"
                  : "none",
              }}
            />
          </div>

          {/* AUTO */}
          <div style={{ width: imageW }}>
            <img
              src={images[1]}
              alt="Auto"
              style={{
                width: "100%",
                transform: "translate(20px, 30px)",
                opacity: visibleImages[1] ? 1 : 0,
                animation: visibleImages[1]
                  ? "zielFade 0.6s ease-out forwards"
                  : "none",
              }}
            />
          </div>
        </div>

        {/* ZIELE */}
        <div
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 600,
            color: "#002b5c",
            paddingTop: "clamp(18px, 3vh, 40px)",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          Ziele
        </div>

        {/* RECHTS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap,
            paddingRight: sidePadding,
            paddingLeft: "clamp(24px, 4vw, 64px)",
            transform: lift,
          }}
        >
          {/* FAMILIE */}
          <div style={{ width: imageW }}>
            <img
              src={images[2]}
              alt="Familie"
              style={{
                width: "100%",
                transform: "translate(-20px, 30px)",
                opacity: visibleImages[2] ? 1 : 0,
                animation: visibleImages[2]
                  ? "zielFade 0.6s ease-out forwards"
                  : "none",
              }}
            />
          </div>

          {/* STRAND */}
          <div style={{ width: imageW }}>
            <img
              src={images[3]}
              alt="Strand"
              style={{
                width: "100%",
                opacity: visibleImages[3] ? 1 : 0,
                animation: visibleImages[3]
                  ? "zielFade 0.6s ease-out forwards"
                  : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* RING */}
      {showRing && (
        <div
          onClick={handleClick}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 200,
            cursor: "pointer",
          }}
        >
          <PulseCircle size={110} />
        </div>
      )}

      {/* SITUATION */}
      {showSituation && (
        <div
          style={{
            position: "absolute",
            bottom: "clamp(40px, 8vh, 120px)",
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 600,
            color: "#002b5c",
          }}
        >
          Situation
        </div>
      )}
    </div>
  );
}
