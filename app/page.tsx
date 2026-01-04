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
    bottom: "clamp(40px, 7vh, 80px)",
    left: -20,
  }}
>
  <div
    style={{
      position: "relative",
      width: "clamp(200px, 45vw, 1000px)", // responsive width
      height: "calc(clamp(200px, 40vw, 1000px) * 0.45)", // Höhe aus Seitenverhältnis
    }}
  >
    <Image
      src="/ovb-overlay.png"
      alt="Overlay"
      fill
      sizes="(max-width: 1000px) 60vw, 1000px"
      style={{
        objectFit: "contain",
      }}
    />
  </div>
</div>


      {/* Navigations‑Kreise – FIX positioniert */}
      <div
  style={{
    position: "absolute",
    bottom: "clamp(40px, 5vh, 120px)",
    left: "clamp(40px, 5vw, 200px)",
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
          href="/pages/werbung"
          icon="/werbung-icon.png"
          label={ <> Mehrwert<br /> zeigen</> }
        />
        <NavCircle
          href="/pages/empfehlung"
          icon="/netzwerk-icon.png"
          label="Netzwerk"
        />
        <NavCircle
          href="/pages/chancenblatt"
          icon="/chancenblatt-icon.png"
          label="Chancenblatt"
        />
      </div>

    </AppScreenWrapper>
  );
}
