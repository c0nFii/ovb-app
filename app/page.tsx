"use client";

import Image from "next/image";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import NavCircle from "@/components/NavCircle";

export default function HomePage() {
  return (
    <AppScreenWrapper>

      {/* Hintergrund */}
      <Image
        src="/ovb-header.png"
        alt="Header"
        fill
        priority
        className="object-cover"
      />

      {/* Weißes Overlay oben */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 70,
          background: "rgba(255,255,255,0.8)",
        }}
      />

      {/* OVB Overlay */}
      <div
  style={{
    position: "absolute",
    bottom: "clamp(40px, 10vh, 120px)",
    left: 0,
  }}
>

        <Image
          src="/ovb-overlay.png"
          alt="Overlay"
          width={1000}
          height={200}
        />
      </div>

      {/* Navigations‑Kreise – FIX positioniert */}
      <div
  style={{
    position: "absolute",
    bottom: "clamp(40px, 10vh, 120px)",
    left: "clamp(40px, 12vw, 200px)",
    display: "flex",
    gap: "clamp(20px, 4vw, 50px)",
  }}
>

        <NavCircle
          href="/pages/kapitalmarkt"
          icon="/kapitalmarkt-icon.png"
          label={ <> Der<br /> Kapitalmarkt </>}
        />
        <NavCircle
          href="/pages/lebensplan"
          icon="/lebensplan-icon.png"
          label="Finanzieller Lebensplan"
        />
        <NavCircle
          href="/pages/abs"
          icon="/abs-icon.png"
          label="ABS‑System"
        />
        <NavCircle
          href="/werbung"
          icon="/werbung-icon.png"
          label="Werbung"
        />
      </div>

    </AppScreenWrapper>
  );
}
