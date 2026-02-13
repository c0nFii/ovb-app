"use client";

import Image from "next/image";
import Link from "next/link";
import {
  APP_AREA_LABELS,
  type AppArea,
  getOverviewApps,
} from "@/app/config/app-catalog";

const AREAS: AppArea[] = ["ovb-suite", "future-apps"];

export default function AppOverview() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at 15% 20%, #dbe8f4 0%, #f5f8fb 40%, #eef3f8 100%)",
        padding: "44px 28px 52px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: "#003A66", fontSize: "clamp(28px, 3vw, 44px)" }}>
            App Ubersicht
          </h1>
          <p style={{ margin: "10px 0 0", color: "#2a4a67", fontSize: 16 }}>
            Additive Verwaltungsseite. Bestehende App-Flows bleiben unverandert.
          </p>
        </header>

        {AREAS.map((area) => {
          const entries = getOverviewApps(area);
          return (
            <section key={area} style={{ marginBottom: 26 }}>
              <h2 style={{ color: "#003A66", marginBottom: 12, fontSize: 20 }}>
                {APP_AREA_LABELS[area]}
              </h2>

              {entries.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #86a4bf",
                    borderRadius: 14,
                    padding: 16,
                    color: "#385671",
                    background: "rgba(255,255,255,0.65)",
                  }}
                >
                  Noch keine Eintrage.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 14,
                  }}
                >
                  {entries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={entry.route}
                      style={{
                        textDecoration: "none",
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid #cddbeb",
                        boxShadow: "0 10px 24px rgba(9, 51, 90, 0.08)",
                        padding: 14,
                        color: "#12324e",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 12,
                          background: "#f1f6fb",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Image src={entry.icon} alt={entry.title} width={34} height={34} />
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, lineHeight: 1.2 }}>{entry.title}</div>
                        <div style={{ fontSize: 13, opacity: 0.82, marginTop: 4 }}>{entry.subtitle}</div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{entry.route}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
