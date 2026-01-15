"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import LaserPointer from "@/components/presentation/LaserPointer";
import PulseCircle from "@/components/presentation/PulseCircle";

export default function WerbungFlow({
  mode,
  onComplete,
}: {
  mode: any;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [showRing, setShowRing] = useState(false);

  const group200 = ["200_1.png", "200_2.png", "200_3.png", "200_4.png", "200_5.png"];
  const groupX = ["x2.png", "x3.png", "x4.png", "x5.png"];

  /* =========================
     STEP LOGIK + RING
     ========================= */

  useEffect(() => {
    if (step >= 5) {
      setShowRing(false);
      onComplete(); // ✅ FLOW IST FERTIG
      return;
    }

    setShowRing(false);
    const t = setTimeout(
      () => setShowRing(true),
      step >= 3 ? 2500 : 1500
    );

    return () => clearTimeout(t);
  }, [step, onComplete]);

  const handleRingClick = () => {
    setShowRing(false);
    setStep((s) => s + 1);
  };

  /* =========================
     WIPE STYLE
     ========================= */

  const wipeStyle = (isNew: boolean): React.CSSProperties => ({
    objectFit: "contain",
    clipPath: isNew ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
    animation: isNew ? "wipeIn 3s ease forwards" : "none",
  });

  /* =========================
     RENDER
     ========================= */

  return (
    <>
      {/* ===== LASER ===== */}
      <LaserPointer mode={mode} />

      {/* ===== BILDERBEREICH ===== */}
      <div style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(300px, 60vw, 1400px)",
            height: "clamp(200px, 40vw, 1400px)",
          }}
        >
          {step >= 0 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <Image src="/pictures/werbung.png" alt="" fill style={wipeStyle(step === 0)} />
            </div>
          )}

          {step >= 1 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <Image src="/pictures/kunde.png" alt="" fill style={wipeStyle(step === 1)} />
            </div>
          )}

          {step >= 2 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <Image src="/pictures/1000.png" alt="" fill style={wipeStyle(step === 2)} />
            </div>
          )}

          {step >= 3 &&
            group200.map((img) => (
              <div key={img} style={{ position: "absolute", inset: 0 }}>
                <Image src={`/pictures/${img}`} alt="" fill style={wipeStyle(step === 3)} />
              </div>
            ))}

          {step >= 4 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <Image src="/pictures/x1.png" alt="" fill style={wipeStyle(step === 4)} />
            </div>
          )}

          {step >= 5 &&
            groupX.map((img) => (
              <div key={img} style={{ position: "absolute", inset: 0 }}>
                <Image src={`/pictures/${img}`} alt="" fill style={wipeStyle(step === 5)} />
              </div>
            ))}
        </div>
      </div>

      {/* ===== RING ===== */}
      {showRing && step < 5 && (
        <PulseCircle
          onClick={handleRingClick}
          style={{
            position: "absolute",
            top: "40%",
            left: "80%",
            transform: "translateY(-50%)",
            zIndex: 100,
            pointerEvents: "auto",
          }}
        />
      )}

      {/* ===== ANIMATION ===== */}
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
