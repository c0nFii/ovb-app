import { OVB_BLUE } from "@/app/pages/kontaktbogen/page";



export function CleanupDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(12px, 3vw, 16px)",
        }}
      >
        {/* Titel */}
        <div
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            fontWeight: 700, // 🔥 extra fett
            color: OVB_BLUE,
          }}
        >
          Export erfolgreich
        </div>

        {/* Text */}
        <div
          style={{
            fontSize: "clamp(14px, 2.5vw, 16px)",
            fontWeight: 600,
            color: OVB_BLUE, // 🔥 OVB blau
          }}
        >
          Möchtest du die eingegebenen Daten jetzt löschen?
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "clamp(10px, 3vw, 12px)",
            marginTop: "clamp(6px, 2vw, 8px)",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: "#fff", // 🔥 weißer Hintergrund
              
              color: OVB_BLUE,
              
              padding:
                "clamp(7px, 2.5vw, 8px) clamp(12px, 3vw, 14px)",
              fontSize: "clamp(13px, 2.5vw, 14px)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Nein
          </button>

          <button
            onClick={onConfirm}
            style={{
              background: OVB_BLUE,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding:
                "clamp(7px, 2.5vw, 8px) clamp(12px, 3vw, 14px)",
              fontSize: "clamp(13px, 2.5vw, 14px)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Ja, löschen
          </button>
        </div>
      </div>
    </div>
  );
}
