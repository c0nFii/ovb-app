import { OVB_BLUE } from "@/app/pages/kontaktbogen/page";

export function NothingToExportDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "clamp(12px, 4vw, 24px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "clamp(20px, 4vw, 32px)",
          borderRadius: "14px",
          width: "clamp(280px, 90vw, 360px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(12px, 3vw, 16px)",
        }}
      >
        <div
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            fontWeight: 700,
            color: OVB_BLUE,
          }}
        >
          Nichts zu exportieren
        </div>

        <div
          style={{
            fontSize: "clamp(14px, 2.5vw, 15px)",
            color: OVB_BLUE,
            fontWeight: 600,
          }}
        >
          Bitte gib zuerst Notizen oder Kontakte ein.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: OVB_BLUE,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "clamp(7px, 2.5vw, 8px) clamp(12px, 3vw, 14px)",
              fontSize: "clamp(13px, 2.5vw, 14px)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
