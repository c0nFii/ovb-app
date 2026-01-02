"use client";

import Image from "next/image";
import React, { ReactNode } from "react";

export default function NavCircle({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: ReactNode;
}) {
  return (
    <a
  href={href}
  style={{
    width: "clamp(80px, 6vw, 150px)",
    height: "clamp(80px, 6vw, 150px)",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#002b5c",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    paddingTop: 2,
    paddingBottom: 20,
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.08)";
    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.25)";
  }}
>

      <Image
        src={icon}
        alt=""
        width={0}               // 👈 deaktiviert feste Größe
        height={0}              // 👈 deaktiviert feste Größe
        style={{
          width: "clamp(28px, 2vw, 55px)",     // 👈 responsive Icon
          height: "clamp(28px, 2vw, 55px)",
          marginBottom: 5,
        }}
      />

      <div
        style={{
          fontSize: "clamp(10px, 1.2vw, 12px)", // 👈 responsive Text
          lineHeight: 1.15,
        }}
      >
        {label}
      </div>
    </a>
  );
}
