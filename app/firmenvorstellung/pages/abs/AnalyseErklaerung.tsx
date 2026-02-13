"use client";

import { useState, useEffect } from "react";

type AnalyseErklaerungProps = {
  containerHeight: number;
  onDone?: () => void;
};

export default function AnalyseErklaerung({ containerHeight, onDone }: AnalyseErklaerungProps) {
  const [zoom, setZoom] = useState(false);
  const [blink1, setBlink1] = useState(false);
  const [showVorteil, setShowVorteil] = useState(false);
  const [blink2, setBlink2] = useState(false);

  // Bildbereich berechnen
  const circleSize = Math.min(containerHeight * 0.55, 480);

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
      setBlink1(false);
      setShowVorteil(true);

      setTimeout(() => {
        setBlink2(true);
      }, 2000);

      return;
    }

    // PHASE 2 → Screenshot + Weiter
    if (blink2) {
      onDone?.();
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      
      {/* Kreisbereich - zentriert mit berechneter Größe */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: circleSize,
          height: circleSize,
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
              maxWidth: circleSize * 0.29,
              maxHeight: circleSize * 0.29,
              width: "auto",
              height: "auto",
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
              maxWidth: circleSize * 0.54,
              maxHeight: circleSize * 0.54,
              width: "auto",
              height: "auto",
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
              maxWidth: circleSize * 0.29,
              maxHeight: circleSize * 0.29,
              width: "auto",
              height: "auto",
              transition: "top 0.6s ease",
              zIndex: 3,
              animation: blink1 || blink2 ? "blinkB 1.1s ease-in-out infinite" : "none",
              cursor: blink1 || blink2 ? "pointer" : "default",
              pointerEvents: blink1 || blink2 ? "auto" : "none",
            }}
          />

          {/* S → grau */}
          <img
            src="/pictures/shalb.png"
            style={{
              position: "absolute",
              left: "-20%",
              top: zoom ? "105%" : "85%",
              transform: "translateY(-50%)",
              maxWidth: circleSize * 0.29,
              maxHeight: circleSize * 0.29,
              width: "auto",
              height: "auto",
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
              maxWidth: circleSize * 0.5,
              maxHeight: circleSize * 0.5,
              width: "auto",
              height: "auto",
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
              maxWidth: circleSize * 0.5,
              maxHeight: circleSize * 0.5,
              width: "auto",
              height: "auto",
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
              maxWidth: circleSize * 0.5,
              maxHeight: circleSize * 0.5,
              width: "auto",
              height: "auto",
              transform: "rotate(85deg)",
              filter: "grayscale(100%) brightness(0.8)",
              transition: "all 0.6s ease",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* SVG Overlay für Hint Text (export-stabil) */}
      {showVorteil && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 200,
          }}
        >
          <text
            x="75%"
            y="70%"
            fontSize="26"
            fill="#CC0066"
            fontFamily="Arial, sans-serif"
            fontWeight="700"
            style={{ opacity: 0, animation: "svgFadeIn 0.5s ease-out forwards" }}
          >
            €3.000 Vorteil
          </text>
        </svg>
      )}

      <style jsx>{`
        @keyframes blinkB {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes svgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}