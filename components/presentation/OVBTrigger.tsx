"use client";

export default function OVBTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        inset: 0,
        margin: "auto",

        /* 🔥 adaptive Größe */
        width: "min(80px, 12vw)",
        height: "min(80px, 12vw)",

        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        /* 🔥 adaptive Icon‑Größe */
        fontSize: "min(48px, 7vw)",

        color: "#002b5c",
        cursor: "pointer",
        zIndex: 60,
        animation: "blink 1.2s infinite",
      }}
    >
      ⚠️
    </div>
  );
}
