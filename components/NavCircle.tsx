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
        width: 120,
        height: 120,
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
      }}
    >
      <Image
  src={icon}
  alt=""
  width={55}
  height={55}
  style={{ marginBottom: 2 }}
/>

      <div style={{ fontSize: 12, lineHeight: 1.15 }}>{label}</div>
    </a>
  );
}
