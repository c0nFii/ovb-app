"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PenOptionsPopover from "./PenOptionsPopover";
import { PresentationMode } from "@/app/types/presentation";
import { usePen } from "./PenContext";
import NotesPopup from "@/components/NotesPopup";

export default function TopBar({
  mode,
  setMode,
  onSave,
}: {
  mode: PresentationMode;
  setMode: (m: PresentationMode) => void;
  onSave?: () => void;
}) {
  const pathname = usePathname();

  // 🔥 Globaler Pen-State
  const { color, width, setColor, setWidth } = usePen();

  // 🔥 Popover States
  const [showPenOptions, setShowPenOptions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const nextPageMap: Record<string, string | null> = {
    "/": "/pages/kapitalmarkt",
    "/pages/kapitalmarkt": "/pages/lebensplan",
    "/pages/lebensplan": "/pages/abs",
    "/pages/abs": "/pages/werbung",
    "/pages/werbung": "/pages/empfehlung",
    "/pages/empfehlung": null,
  };

  const nextPage = nextPageMap[pathname] ?? null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
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
          {/* LINKS */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
  {/* 🏠 HOME */}
  <Link href="/">
    <Image
      src="/home-icon.png"
      alt="Startseite"
      width={50}
      height={50}
      className="cursor-pointer transition-transform hover:scale-110"
    />
  </Link>

  {/* 📝 NOTIZEN */}
  <Tool
    icon="/icons/notizen.png"
    active={showNotes}
    onClick={() => {
      setShowPenOptions(false);
      setShowNotes((v) => !v);
    }}
  />
</div>


          {/* MITTE — Tools */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {/* ✏️ Stift */}
            <Tool
              icon="/icons/stift.png"
              active={mode === "draw"}
              onClick={() => {
                setShowNotes(false);
                if (mode === "draw") {
                  setShowPenOptions((v) => !v);
                } else {
                  setMode("draw");
                  setShowPenOptions(false);
                }
              }}
            />

            <Tool
              icon="/icons/radierer.png"
              active={mode === "erase"}
              onClick={() => {
                setMode("erase");
                setShowPenOptions(false);
                setShowNotes(false);
              }}
            />

            <Tool
              icon="/icons/laserpointer.png"
              active={mode === "laser"}
              onClick={() => {
                setMode("laser");
                setShowPenOptions(false);
                setShowNotes(false);
              }}
            />

            <Tool
              icon="/icons/normalmodus.png"
              active={mode === "normal"}
              onClick={() => {
                setMode("normal");
                setShowPenOptions(false);
                setShowNotes(false);
              }}
            />

            {onSave && <Tool icon="/icons/save.png" onClick={onSave} />}
          </div>

          {/* RECHTS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
            <NavIcon
              src="/icons/arrow-left.png"
              onClick={() => window.history.back()}
            />
            <NavIcon
              src="/icons/refresh-icon.png"
              onClick={() => window.location.reload()}
            />

            {nextPage && (
              <Link href={nextPage}>
                <Image
                  src="/icons/arrow-right.png"
                  alt="Weiter"
                  width={50}
                  height={50}
                />
              </Link>
            )}
          </div>
        </div>

        {/* 🔥 PEN OPTIONS POPOVER */}
        {showPenOptions && (
          <PenOptionsPopover
            currentColor={color}
            currentWidth={width}
            onSelect={(c, w) => {
              setColor(c);
              setWidth(w);
              setShowPenOptions(false);
            }}
            onClose={() => setShowPenOptions(false)}
          />
        )}
      </div>

      {/* 📝 NOTES POPUP */}
      {showNotes && <NotesPopup onClose={() => setShowNotes(false)} />}
    </>
  );
}

/* =========================
   SUB COMPONENTS
   ========================= */

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
      width={50}
      height={50}
      onClick={onClick}
      className={`cursor-pointer transition-transform hover:scale-110 ${
        active ? "scale-125 drop-shadow-xl" : ""
      }`}
    />
  );
}

function NavIcon({ src, onClick }: { src: string; onClick: () => void }) {
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
