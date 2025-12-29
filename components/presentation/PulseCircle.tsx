"use client";

import { CSSProperties } from "react";

export default function PulseCircle({
  size = 190,
  color = "#002b5c",
  onClick,
  style = {},
}: {
  size?: number;
  color?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",

        /*
          Adaptive Größe:
          - Desktop: bleibt bei `size`
          - Tablet: skaliert sichtbar kleiner
          - Nie zu klein, nie zu groß
        */
        width: `clamp(${size * 0.1}px, 13vw, ${size}px)`,
        height: `clamp(${size * 0.1}px, 13vw, ${size}px)`,

        borderRadius: "50%",
        cursor: onClick ? "pointer" : "default",
        overflow: "visible",
        ...style,
      }}
    >
      {/* Pulsierender Ring */}
      <div
        className="pulse-ring"
        style={{
          borderColor: color,
        }}
      />
    </div>
  );
}
