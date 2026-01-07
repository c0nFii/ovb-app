"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import DrawingSVG from "@/components/presentation/DrawingSVG";
import LaserPointer from "@/components/presentation/LaserPointer";
import PulseCircle from "@/components/presentation/PulseCircle";


export default function GrundSkel({
  mode,
  start,
  onFinish,
}: {
  mode: any;
  start: boolean;
  onFinish: () => void;
}) {
  const [step, setStep] = useState(-1);
  const [showRing, setShowRing] = useState(false);

  const sequence = [
    "werbung1.png",
    "werbung2.png",
    "werbung3.png",
    "werbungskreuz.png",
  ];

  const groupImages = ["201.png", "202.png", "203.png", "204.png", "205.png"];

  useEffect(() => {
    if (start && step === -1) {
      setStep(0);
    }
  }, [start, step]);

  useEffect(() => {
    if (step < 0) return;

    if (step < sequence.length) {
      const t = setTimeout(() => setStep(step + 1), 1300);
      return () => clearTimeout(t);
    }

    if (step === sequence.length) {
      const t = setTimeout(() => setStep(step + 1), 500);
      return () => clearTimeout(t);
    }

    if (step === sequence.length + 1) {
      const t = setTimeout(() => setShowRing(true), 3200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleRingClick = () => {
    setShowRing(false);
    onFinish();
  };

  return (
    <>
      {/* ===== SVG & LASER — IMMER OBEN, NIE TRANSFORMIERT ===== */}
      <LaserPointer mode={mode} />

      {/* ===== BILDERBEREICH — DARF TRANSFORMIERT WERDEN ===== */}
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
          {sequence.map((img, i) =>
            step >= i ? (
              <div key={img} style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={`/pictures/${img}`}
                  alt=""
                  fill
                  style={{
                    objectFit: "contain",
                    clipPath:
                      step === i ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
                    animation:
                      step === i ? "wipeIn 3s ease forwards" : "none",
                  }}
                />
              </div>
            ) : null
          )}

          {step > sequence.length &&
            groupImages.map((img) => (
              <div key={img} style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={`/pictures/${img}`}
                  alt=""
                  fill
                  style={{
                    objectFit: "contain",
                    clipPath: "inset(100% 0 0 0)",
                    animation: "wipeIn 3s ease forwards",
                  }}
                />
              </div>
            ))}
        </div>
      </div>

      {/* ===== RING ===== */}
      {showRing && (
        <PulseCircle
          onClick={handleRingClick}
          style={{
            position: "absolute",
            top: "40%",
            left: "80%",
            transform: "translateY(-50%)",
            zIndex: 9999,
            pointerEvents: "auto",
          }}
        />
      )}

      <style jsx>{`
        @keyframes wipeIn {
          0% {
            clip-path: inset(0 0 100% 0);
          }
          100% {
            clip-path: inset(0 0 0 0);
          }
        }
      `}</style>
    </>
  );
}
