"use client";

import Image from "next/image";
import { PresentationMode } from "@/app/types/presentation";

export default function TopBar({
  mode,
  setMode,
  onSave,
}: {
  mode: PresentationMode;
  setMode: (m: PresentationMode) => void;
  onSave?: () => void;
}) {
  return (
    <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,

    /* 🔥 KEIN vw / dvw */
    width: "100%",

    background: "rgba(255,255,255,0.85)",
    zIndex: 9999,
    padding: "8px 24px",
  }}
>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          color: "#002b5c",
        }}
      >
        {/* LINKS: Home */}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <a href="/">
            <Image
              src="/home-icon.png"
              alt="Startseite"
              width={60}
              height={60}
              className="cursor-pointer transition-transform hover:scale-110"
            />
          </a>
        </div>

        {/* MITTE: Tools */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Tool icon="/icons/stift.png" active={mode === "draw"} onClick={() => setMode("draw")} />
          <Tool icon="/icons/radierer.png" active={mode === "erase"} onClick={() => setMode("erase")} />
          <Tool icon="/icons/laserpointer.png" active={mode === "laser"} onClick={() => setMode("laser")} />
          <Tool icon="/icons/normalmodus.png" active={mode === "normal"} onClick={() => setMode("normal")} />

          {onSave && <Tool icon="/icons/save.png" onClick={onSave} />}
        </div>

        {/* RECHTS: Navigation */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <NavIcon src="/icons/arrow-left.png" onClick={() => window.history.back()} />
          <NavIcon src="/icons/refresh-icon.png" onClick={() => window.location.reload()} />
          <a href="/pages/lebensplan">
            <Image src="/icons/arrow-right.png" alt="Weiter" width={50} height={50} />
          </a>
        </div>
      </div>
    </div>
  );
}

function Tool({
  icon,
  active,
  onClick,
}: {
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Image
      src={icon}
      alt=""
      width={40}
      height={40}
      onClick={onClick}
      className={`cursor-pointer transition-transform hover:scale-110 ${
        active ? "scale-125 drop-shadow-xl" : ""
      }`}
    />
  );
}

function NavIcon({
  src,
  onClick,
}: {
  src: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick}>
      <Image
        src={src}
        alt=""
        width={50}
        height={50}
        className="cursor-pointer transition-transform hover:scale-110"
      />
    </button>
  );
}
