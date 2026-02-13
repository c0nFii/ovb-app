"use client";

import { useState, useEffect } from "react";

type BeratungErklaerungProps = {
  containerHeight: number;
  onDone?: () => void;
};

export default function BeratungErklaerung({ containerHeight, onDone }: BeratungErklaerungProps) {
  const [anim, setAnim] = useState(false);
  const [blinkS, setBlinkS] = useState(false);

  // Bildbereich berechnen
  const circleSize = Math.min(containerHeight * 0.55, 480);

  // Start animation
  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Start blinking after animation
  useEffect(() => {
    if (anim) {
      const t = setTimeout(() => setBlinkS(true), 800);
      return () => clearTimeout(t);
    }
  }, [anim]);

  // Klick → Screenshot + Weiter
  const handleClick = () => {
    if (blinkS) {
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

          {/* analyse.png → fährt runter, wird kleiner, verschwindet */}
          <img
            src="/pictures/analyse.png"
            style={{
              position: "absolute",
              left: anim ? "-20%" : "50%",
              top: anim ? "105%" : "30%",
              transform: anim
                ? "translateY(-50%) scale(1)"
                : "translate(-50%, -50%) scale(2.25)",
              maxWidth: circleSize * 0.54,
              maxHeight: circleSize * 0.54,
              width: "auto",
              height: "auto",
              filter: anim ? "grayscale(100%) brightness(0.8)" : "none",
              opacity: anim ? 0 : 1,
              transition: "all 0.8s ease",
              zIndex: 4,
            }}
          />

          {/* ahalb.png → erscheint erst am Ende (grau) */}
          <img
            src="/pictures/ahalb.png"
            style={{
              position: "absolute",
              left: "-20%",
              top: "105%",
              transform: "translateY(-50%)",
              maxWidth: circleSize * 0.29,
              maxHeight: circleSize * 0.29,
              width: "auto",
              height: "auto",
              filter: "grayscale(100%) brightness(0.8)",
              opacity: anim ? 1 : 0,
              transition: "opacity 0.4s ease 0.6s",
              zIndex: 3,
            }}
          />

          {/* beratung.png → fährt nach oben */}
          <img
            src="/pictures/beratung.png"
            style={{
              position: "absolute",
              left: anim ? "50%" : "80%",
              top: anim ? "30%" : "105%",
              transform: anim
                ? "translate(-50%, -50%) scale(2.25)"
                : "translateY(-50%) scale(1)",
              maxWidth: circleSize * 0.54,
              maxHeight: circleSize * 0.54,
              width: "auto",
              height: "auto",
              transition: "all 0.8s ease",
              zIndex: 5,
            }}
          />

          {/* shalb.png → fährt nach rechts unten, blinkt */}
          <img
            src="/pictures/shalb.png"
            onClick={handleClick}
            style={{
              position: "absolute",
              left: anim ? "90%" : "-20%",
              top: "105%",
              transform: "translateY(-50%)",
              maxWidth: circleSize * 0.29,
              maxHeight: circleSize * 0.29,
              width: "auto",
              height: "auto",
              filter: anim ? "none" : "grayscale(100%) brightness(0.8)",
              transition: "all 0.8s ease",
              zIndex: 3,
              animation: blinkS ? "blinkS 1.1s ease-in-out infinite" : "none",
              cursor: blinkS ? "pointer" : "default",
              pointerEvents: blinkS ? "auto" : "none",
            }}
          />

          {/* Pfeil B → folgt dem großen Kreis (beratung.png) */}
          <img
            src="/pictures/pfeils2.png"
            style={{
              position: "absolute",
              left: anim ? "63%" : "60%",
              top: anim ? "38%" : "20%",
              maxWidth: circleSize * 0.5,
              maxHeight: circleSize * 0.5,
              width: "auto",
              height: "auto",
              transform: anim
                ? "rotate(15deg) scale(1.15)"
                : "rotate(15deg) scale(1)",
              transition: "all 0.8s ease",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Pfeil S → folgt dem linken Kreis */}
          <img
            src="/pictures/pfeils.png"
            style={{
              position: "absolute",
              right: "60%",
              top: anim ? "40%" : "20%",
              maxWidth: circleSize * 0.5,
              maxHeight: circleSize * 0.5,
              width: "auto",
              height: "auto",
              transform: "rotate(85deg)",
              filter: "grayscale(100%) brightness(0.8)",
              transition: "all 0.8s ease",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes blinkS {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}