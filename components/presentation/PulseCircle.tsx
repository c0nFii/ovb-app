"use client";

import { CSSProperties } from "react";

type PulseCircleProps = {
  size?: number;
  color?: string;
  onClick?: () => void;
  style?: CSSProperties;
};

export default function PulseCircle({
  size = 220,
  color = "#002b5c",
  onClick,
  style = {},
}: PulseCircleProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: `clamp(${size * 0.1}px, 13vw, ${size}px)`,
        height: `clamp(${size * 0.1}px, 13vw, ${size}px)`,
        borderRadius: "50%",
        cursor: onClick ? "pointer" : "default",
        overflow: "visible",
        ...style,
      }}
    >
      {/* 🔵 Pulsierender Ring */}
      <span className="pulse-ring" style={{ borderColor: color }} />
    </div>
  );
}
