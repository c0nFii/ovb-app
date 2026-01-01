"use client";

import { useState, useEffect } from "react";

type AnalyseErklaerungProps = {
  onDone?: () => void;
};

export default function AnalyseErklaerung({ onDone }: AnalyseErklaerungProps) {
  const [zoom, setZoom] = useState(false);

  const [blink1, setBlink1] = useState(false);     // erstes Blinken
  const [showVorteil, setShowVorteil] = useState(false); // Text sichtbar
  const [blink2, setBlink2] = useState(false);     // zweites Blinken

  // Startet Zoom
  useEffect(() => {
    const t = setTimeout(() => setZoom(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Startet erstes Blinken
  useEffect(() => {
    if (zoom) {
      const t = setTimeout(() => setBlink1(true), 800);
      return () => clearTimeout(t);
    }
  }, [zoom]);

  // Klick-Handler
  const handleClick = () => {
    // PHASE 1 → Vorteil anzeigen
    if (blink1 && !showVorteil) {
      setBlink1(false);       // Blinken stoppen
      setShowVorteil(true);   // Text anzeigen

      // Nach 2 Sekunden → wieder blinken
      setTimeout(() => {
        setBlink2(true);
      }, 2000);

      return;
    }

    // PHASE 2 → Weiter
    if (blink2) {
      setShowVorteil(false);
      onDone?.();
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      
      {/* Titel */}
      <div
        style={{
          position: "absolute",
          top: "clamp(40px, 8vh, 100px)",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(22px, 3vw, 36px)",
          fontWeight: 700,
          color: "#002b5c",
        }}
      >
        A – Analyse
      </div>

      {/* ABS-Kreisbereich */}
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

        <div style={{ position: "absolute", inset: 0 }}>

          {/* A → smooth highlight + fade-out */}
          <img
            src="/pictures/a.png"
            style={{
              position: "absolute",
              left: "50%",
              top: zoom ? "30%" : "20%",
              transform: zoom
                ? "translate(-50%, -50%) scale(1.15)"
                : "translate(-50%, -50%) scale(1)",
              width: "clamp(80px, 12vw, 140px)",
              opacity: zoom ? 0 : 1,
              transition: "all 0.6s ease",
              zIndex: 3,
            }}
          />

          {/* analyse.png → zoomt rein */}
          <img
            src="/pictures/analyse.png"
            style={{
              position: "absolute",
              left: "50%",
              top: zoom ? "30%" : "20%",
              transform: zoom
                ? "translate(-50%, -50%) scale(2.25)"
                : "translate(-50%, -50%) scale(1.8)",
              width: "clamp(180px, 30vw, 260px)",
              opacity: zoom ? 1 : 0,
              transition: "all 0.8s ease 0.1s",
              zIndex: 4,
            }}
          />

          {/* B → blinkt Phase 1 → Vorteil → blinkt Phase 2 */}
          <img
            src="/pictures/bhalb.png"
            onClick={handleClick}
            style={{
              position: "absolute",
              right: "-20%",
              top: zoom ? "105%" : "85%",
              transform: "translateY(-50%)",
              width: "clamp(80px, 12vw, 140px)",
              transition: "top 0.6s ease",
              zIndex: 3,
              animation:
                blink1 || blink2
                  ? "blinkB 1.1s ease-in-out infinite"
                  : "none",
              cursor: blink1 || blink2 ? "pointer" : "default",
              pointerEvents: blink1 || blink2 ? "auto" : "none",
            }}
          />

          {/* Vorteil > 3.000€ */}
          {showVorteil && (
            <div
              style={{
                position: "absolute",
                left: "120%",
                top: "75%",
                whiteSpace: "nowrap",
                fontSize: "clamp(16px, 2.2vw, 26px)",
                fontWeight: 700,
                color: "#CC0066",
                zIndex: 5,
              }}
            >
              €3.000 Vorteil
            </div>
          )}

          {/* S → grau */}
          <img
            src="/pictures/shalb.png"
            style={{
              position: "absolute",
              left: "-20%",
              top: zoom ? "105%" : "85%",
              transform: "translateY(-50%)",
              width: "clamp(80px, 12vw, 140px)",
              filter: "grayscale(100%) brightness(0.8)",
              transition: "top 0.6s ease",
              zIndex: 2,
            }}
          />

          {/* Pfeil A */}
          <img
            src="/pictures/pfeila.png"
            style={{
              position: "absolute",
              left: zoom ? "63%" : "60%",
              top: zoom ? "38%" : "20%",
              width: "clamp(100px, 40vw, 240px)",
              height: "clamp(100px, 40vw, 240px)",
              objectFit: "contain",
              transform: zoom
                ? "rotate(15deg) scale(1.15)"
                : "rotate(15deg) scale(1)",
              transition: "all 0.6s ease",
              zIndex: 1,
            }}
          />

          {/* Pfeil B */}
          <img
            src="/pictures/pfeilb.png"
            style={{
              position: "absolute",
              left: "25%",
              top: zoom ? "80%" : "60%",
              width: "clamp(100px, 40vw, 240px)",
              height: "clamp(100px, 40vw, 240px)",
              objectFit: "contain",
              transform: "rotate(55deg)",
              opacity: zoom ? 0 : 1,
              transition: "all 0.6s ease",
              zIndex: 1,
            }}
          />

          {/* Pfeil S */}
          <img
            src="/pictures/pfeils.png"
            style={{
              position: "absolute",
              right: "60%",
              top: zoom ? "40%" : "20%",
              width: "clamp(100px, 40vw, 240px)",
              height: "clamp(100px, 40vw, 240px)",
              objectFit: "contain",
              transform: "rotate(85deg)",
              filter: "grayscale(100%) brightness(0.8)",
              transition: "all 0.6s ease",
              zIndex: 1,
            }}
          />

        </div>
      </div>

      {/* Blink-Animation */}
      <style jsx>{`
        @keyframes blinkB {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
