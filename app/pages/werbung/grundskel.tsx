"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import LaserPointer from "@/components/presentation/LaserPointer";
import PulseCircle from "@/components/presentation/PulseCircle";

/* =========================
   KONFIGURATION
   ========================= */

const KREUZ_IMAGE = "werbungskreuz.png";
const KREUZ_ANIMATION_DURATION = 4000;
const RING_DELAY = 1200;

/* =========================
   COMPONENT
   ========================= */

export default function GrundSkel({
  mode,
  start,
  onFinish,
}: {
  mode: any;
  start: boolean;
  onFinish: () => void;
}) {
  const [showKreuz, setShowKreuz] = useState(false);
  const [showRing, setShowRing] = useState(false);

  /* =========================
     START → KREUZ EINBLENDEN
     ========================= */

  useEffect(() => {
    if (!start) return;

    setShowKreuz(true);

    const ringTimeout = setTimeout(
      () => setShowRing(true),
      KREUZ_ANIMATION_DURATION + RING_DELAY
    );

    return () => clearTimeout(ringTimeout);
  }, [start]);

  /* =========================
     RING CLICK
     ========================= */

  const handleRingClick = () => {
    setShowRing(false);
    onFinish();
  };

  /* =========================
     RENDER
     ========================= */

  return (
    <>
      {/* ===== LASER ===== */}
      <LaserPointer mode={mode} />

      {/* ===== KREUZ ===== */}
      {showKreuz && (
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
          <Image
            src={`/pictures/${KREUZ_IMAGE}`}
            alt=""
            fill
            style={{
              objectFit: "contain",
              clipPath: "inset(0 0 100% 0)",
              animation: `wipeIn ${KREUZ_ANIMATION_DURATION}ms ease forwards`,
            }}
          />
        </div>
      )}

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

      {/* ===== ANIMATION ===== */}
      <style jsx>{`
        @keyframes wipeIn {
          from {
            clip-path: inset(0 0 100% 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }
      `}</style>
    </>
  );
}
