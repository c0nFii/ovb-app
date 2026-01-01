"use client";

import { useState, useEffect } from "react";

type ServiceErklaerungProps = {
  onDone?: () => void;
};

export default function ServiceErklaerung({ onDone }: ServiceErklaerungProps) {
  const [anim, setAnim] = useState(false);
  const [blinkS, setBlinkS] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (anim) {
      const t = setTimeout(() => setBlinkS(true), 900);
      return () => clearTimeout(t);
    }
  }, [anim]);

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
        S – Service
      </div>

      {/* Kreisbereich */}
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

          {/* service.png → startet rechts unten (shalb-Position) → fährt nach oben Mitte (großer Kreis) */}
          {/* beratung.png → fährt nach oben */}
          <img
            src="/pictures/service.png"
            style={{
              position: "absolute",
              left: anim ? "50%" : "80%",
              top: anim ? "30%" : "105%",
              transform: anim
                ? "translate(-50%, -50%) scale(2.25)"
                : "translateY(-50%) scale(1)",
              width: "clamp(180px, 30vw, 260px)",
              transition: "all 0.8s ease",
              zIndex: 5,
            }}
          />

          {/* bhalb.png → startet oben Mitte (beratung-Position) → fährt nach links unten */}
          <img
            src="/pictures/beratung.png"
            style={{
              position: "absolute",
              left: anim ? "-20%" : "50%",
              top: anim ? "105%" : "30%",
              transform: anim
                ? "translateY(-50%) scale(1)"
                : "translate(-50%, -50%) scale(2.25)",
              width: "clamp(180px, 30vw, 260px)",
              filter: anim ? "grayscale(100%) brightness(0.8)" : "none",
              opacity: anim ? 0 : 1,
              transition: "all 0.8s ease",
              zIndex: 99999,
            }}
          />

          {/* shalb.png → erscheint erst am Ende */}
          <img
            src="/pictures/bhalb.png"
            style={{
              position: "absolute",
              left: "-20%",
              top: "105%",
              transform: "translateY(-50%)",
              width: "clamp(80px, 12vw, 140px)",
              opacity: anim ? 1 : 0,
              transition: "opacity 0.4s ease 0.6s",
              zIndex: 9999,
            }}
          />

          {/* ahalb.png → startet links unten (grauer Halbkreis) → fährt nach rechts unten */}
          <img
  src="/pictures/ahalb.png"
  onClick={() => blinkS && onDone?.()}
  style={{
    position: "absolute",

    // 👇 Startposition = Endposition vom oberen S
    left: anim ? "90%" : "-20%",
    top: "105%", // bleibt gleich

    transform: "translateY(-50%)",
    width: "clamp(80px, 12vw, 140px)",
    filter: anim ? "none" : "grayscale(100%) brightness(0.8)",
    transition: "all 0.8s ease",
    zIndex: 3,
    
    cursor: blinkS ? "pointer" : "default",
    pointerEvents: blinkS ? "auto" : "none",
  }}
/>

          {/* Pfeil S → folgt dem großen Kreis (service.png) */}
          <img
            src="/pictures/pfeila.png"
            style={{
              position: "absolute",
              left: anim ? "63%" : "60%",
              top: anim ? "38%" : "20%",
              width: "clamp(100px, 40vw, 240px)",
              height: "clamp(100px, 40vw, 240px)",
              objectFit: "contain",
              transform: anim
                ? "rotate(15deg) scale(1.15)"
                : "rotate(15deg) scale(1)",
              transition: "all 0.8s ease",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Pfeil A → dekorativ/gravierend, wie von dir gesetzt */}
          <img
            src="/pictures/pfeils2.png"
            style={{
              position: "absolute",
              right: "60%",
              top: anim ? "40%" : "20%",
              width: "clamp(100px, 40vw, 240px)",
              height: "clamp(100px, 40vw, 240px)",
              objectFit: "contain",
              transform: "rotate(270deg)",
              transition: "all 0.8s ease",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

        </div>
      </div>

      {/* Blink Animation (aktuell noch ungenutzt, falls du später klickbares S willst) */}
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
