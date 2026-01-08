"use client";

import { useEffect, useRef } from "react";

export default function PenOptionsPopover({
  onSelect,
  onClose,
  currentColor,
  currentWidth,
}: {
  onSelect: (color: string, width: number) => void;
  onClose: () => void;
  currentColor: string;
  currentWidth: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Klick außerhalb → schließen
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const colors = ["#002b5c", "#ff0000", "#00aa00", "#ffaa00", "#000000"];
  const widths = [2, 4, 6, 8];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 70,
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        padding: "14px 18px",
        borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        zIndex: 99999,
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      {/* Farben */}
      <div style={{ display: "flex", gap: 12 }}>
        {colors.map((c) => (
          <div
            key={c}
            onClick={() => onSelect(c, currentWidth)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: c,
              cursor: "pointer",
              border: c === currentColor ? "3px solid black" : "2px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>

      {/* Strichstärken */}
      <div style={{ display: "flex", gap: 12 }}>
        {widths.map((w) => (
          <div
            key={w}
            onClick={() => onSelect(currentColor, w)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#f0f0f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: w === currentWidth ? "3px solid black" : "2px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                width: w,
                height: w,
                background: "black",
                borderRadius: "50%",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
