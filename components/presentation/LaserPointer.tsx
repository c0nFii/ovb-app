"use client";

import { useEffect, useRef } from "react";

export default function LaserPointer({
  mode,
}: {
  mode: "normal" | "draw" | "erase" | "laser";
}) {
  const laserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const laser = laserRef.current;
    if (!laser) return;

    laser.style.display = "none";

    if (mode !== "laser") return;

    const move = (e: PointerEvent) => {
      laser.style.display = "block";
      laser.style.left = `${e.clientX - 20}px`;
      laser.style.top = `${e.clientY - 20}px`;
    };

    window.addEventListener("pointermove", move);

    return () => {
      window.removeEventListener("pointermove", move);
      laser.style.display = "none";
    };
  }, [mode]);

  return (
    <div
      ref={laserRef}
      style={{
        position: "fixed",
        width: 40,
        height: 40,
        borderRadius: "50%",
        pointerEvents: "none", // 🔥 wichtig
        zIndex: 999999,
        background:
          "radial-gradient(circle, #002b5c 0%, #4fa3e3 70%, transparent 100%)",
        display: "none",
      }}
    />
  );
}
