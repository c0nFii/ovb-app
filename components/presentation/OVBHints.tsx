"use client";

type OVBHintsProps = {
  side: "left" | "right";
};

export default function OVBHints({ side }: OVBHintsProps) {
  const isLeft = side === "left";

  return (
    <div
      className="slide-fade-in"
      style={{
        position: "absolute",

        /* Horizontal */
        [isLeft ? "left" : "right"]: "clamp(40px, 8vw, 120px)",

        /* Vertikal */
        ...(isLeft
          ? { top: "clamp(60px, 10vw, 160px)" }
          : { bottom: "clamp(60px, 10vw, 160px)" }),

        display: "flex",
        alignItems: "center",
        gap: "clamp(8px, 2vw, 16px)",

        fontSize: "clamp(20px, 3vw, 32px)",
        color: "#002b5c",
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontSize: "clamp(26px, 4vw, 40px)",
        }}
      >
        {isLeft ? "" : "✔️"}
      </span>

      <span>
        {isLeft
          ? "Kein eigenes Produkt"
          : "Seit 2006 TÜV geprüft"}
      </span>
    </div>
  );
}
