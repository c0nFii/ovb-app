"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import PenOptionsPopover from "./PenOptionsPopover";
import { PresentationMode } from "@/app/types/presentation";
import { usePen } from "./PenContext";
import NotesPopup from "@/app/firmenvorstellung/pages/home/NotesPopup";
import { APP_CATALOG } from "@/app/config/app-catalog";
import { addMinimizedApp } from "./minimized-apps";

export default function TopBar({
  mode,
  setMode,
  onSave,
  showDraw = true,
  showErase = true,
  showLaser = true,
  showHome = true,
  showNavIcons = true,
  height = 76,
}: {
  mode: PresentationMode;
  setMode: (m: PresentationMode) => void;
  onSave?: () => void;
  showDraw?: boolean;
  showErase?: boolean;
  showLaser?: boolean;
  showHome?: boolean;
  showNavIcons?: boolean;
  height?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { color, width, setColor, setWidth } = usePen();

  const [showPenOptions, setShowPenOptions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const nextPageMap: Record<string, string | null> = {
    "/": "/firmenvorstellung/pages/kapitalmarkt",
    "/firmenvorstellung/pages/kapitalmarkt": "/firmenvorstellung/pages/lebensplan",
    "/firmenvorstellung/pages/lebensplan": "/firmenvorstellung/pages/abs",
    "/firmenvorstellung/pages/abs": "/firmenvorstellung/pages/werbung",
    "/firmenvorstellung/pages/werbung": "/firmenvorstellung/pages/empfehlung",
    "/firmenvorstellung/pages/empfehlung": null,
  };

  const nextPage = nextPageMap[pathname] ?? null;
  const isKontaktbogen = pathname === "/firmenvorstellung/pages/kontaktbogen";

  const handleMinimize = () => {
    const appTitle =
      APP_CATALOG.find((entry) => entry.route === pathname)?.title ?? "Aktuelle App";

    addMinimizedApp(pathname, appTitle);
    router.push("/");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: height,
          background: "rgb(255, 255, 255)",
          zIndex: 9999,
          padding: "8px 24px",
          boxSizing: "border-box",
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
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/" title="Desktop anzeigen" aria-label="Desktop anzeigen">
              <Image
                src="/desktop-icon.png"
                alt="Desktop anzeigen"
                width={42}
                height={42}
                className="cursor-pointer transition-transform hover:scale-110"
              />
            </Link>

            <button
              onClick={handleMinimize}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
              aria-label="Minimieren"
              title="Minimieren"
            >
              <Image
                src="/minimieren-icon.png"
                alt="Minimieren"
                width={42}
                height={42}
                className="transition-transform hover:scale-110"
              />
            </button>

            {showHome && (
              <Link href="/firmenvorstellung/pages/home">
                <Image
                  src="/home-icon.png"
                  alt="Startseite"
                  width={50}
                  height={50}
                  className="cursor-pointer transition-transform hover:scale-110"
                />
              </Link>
            )}

            <Tool
              icon="/icons/notizen.png"
              active={showNotes}
              onClick={() => {
                setShowPenOptions(false);
                setShowNotes((v) => !v);
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {!isKontaktbogen && showDraw && (
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
            )}

            {!isKontaktbogen && showErase && (
              <Tool
                icon="/icons/radierer.png"
                active={mode === "erase"}
                onClick={() => {
                  setMode("erase");
                  setShowPenOptions(false);
                  setShowNotes(false);
                }}
              />
            )}

            {showLaser && (
              <Tool
                icon="/icons/laserpointer.png"
                active={mode === "laser"}
                onClick={() => {
                  setMode("laser");
                  setShowPenOptions(false);
                  setShowNotes(false);
                }}
              />
            )}

            {onSave && <Tool icon="/icons/save.png" onClick={onSave} />}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
            {showNavIcons && (
              <>
                <NavIcon
                  src="/icons/arrow-left.png"
                  onClick={() => window.history.back()}
                />
                <NavIcon
                  src="/icons/refresh-icon.png"
                  onClick={() => window.location.reload()}
                />
              </>
            )}

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

      {showNotes && <NotesPopup onClose={() => setShowNotes(false)} />}
    </>
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
