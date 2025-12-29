"use client";

import { useEffect, useState } from "react";
import PulseCircle from "@/components/presentation/PulseCircle";

const leftProducts = ["LV", "Kredit"];
const rightProducts = ["Konto", "Sparbuch"];

export default function ProduktePfeilFlow({ onDone }: { onDone?: () => void }) {
  const [showProducts, setShowProducts] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [step, setStep] = useState(0);
  const [problemStep, setProblemStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowProducts(true), 400);
    const t2 = setTimeout(() => setShowRing(true), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (step !== 3) return;

    setProblemStep(0);

    const t1 = setTimeout(() => setProblemStep(1), 0);
    const t2 = setTimeout(() => setProblemStep(2), 1200);
    const t3 = setTimeout(() => setProblemStep(3), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

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
          top: "calc(7% + clamp(120px, 18vh, 220px))",
          transform: "translateX(-50%)",
          width: "clamp(180px, 18vw, 320px)",
          height: "clamp(340px, 50vh, 880px)",
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
              clipPath:
                step > i
                  ? "inset(0% 0% 0% 0%)"
                  : "inset(100% 0% 0% 0%)",
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
          top: "calc(60% + 0vh)",
          x: "calc(-51.5% + clamp(-30px, -40vh, -55px) - 107px)",
          startClip: "inset(0% 0% 0% 100%)",
          side: "left",
          textX: "clamp(-120px, -100vw, -50px)",
          textY: "clamp(5px, 7vh, 10px)",
        },
        {
          text: "Unfall",
          index: 2,
          top: "calc(50% + 0vh)",
          x: "calc(2% + clamp(11px, 6vh, 23px) - 18px)",
          startClip: "inset(0% 100% 0% 0%)",
          side: "right",
          textX: "clamp(-80px, -100vw, -50px)",
          textY: "clamp(75px, 7vh, 10px)",
        },
        {
          text: "AMS",
          index: 3,
          top: "calc(40% + clamp(-6vh, -3vh, 8vh) - 30px)",
          x: "calc(-55% + clamp(-175px, -20vw, -90px) + 31px)",
          startClip: "inset(0% 0% 0% 100%)",
          side: "left",
          textX: "clamp(-70px, -100vw, -50px)",
          textY: "clamp(5px, 7vh, 10px)",
        },
      ].map((p) =>
        problemStep >= p.index ? (
          <div
            key={p.text}
            style={{
              position: "absolute",
              left: "50%",
              top: p.top,
              transform: `translateX(${p.x})`,
              width: "clamp(160px, 22vw, 260px)",
            }}
          >
            <img
              src="/pictures/problemlinie.png"
              style={{
                width: "100%",
                clipPath:
                  problemStep === p.index
                    ? p.startClip
                    : "inset(0% 0% 0% 0%)",
                animation:
                  problemStep === p.index
                    ? "wipeIn 1.2s ease-out forwards"
                    : undefined,
              }}
            />

            <div
  style={{
    position: "absolute",
    top: p.textY,
    ...(p.side === "left"
      ? { left: p.textX }
      : { right: p.textX }),
    fontSize: "clamp(16px, 1.8vw, 22px)",
    fontWeight: 600,
    color: "#002b5c",
    whiteSpace: "nowrap",

    opacity: problemStep > p.index ? 1 : 0,

    animationName:
      problemStep === p.index ? "textFadeIn" : "none",
    animationDuration: "0.3s",
    animationTimingFunction: "ease",
    animationFillMode: "forwards",
    animationDelay: "1.2s",
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
                opacity: 0,
                paddingTop: "clamp(8px, 1.5vh, 12px)",
                animation: "fadeIn 0.4s ease forwards",
                animationDelay: `${i * 0.8}s`,
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
            if (step === 3) {
              setShowRing(false);
              onDone?.();
            }
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
