import { OVB_BLUE } from "./kontaktbogenShared";

export default function NameDialog({
  value,
  onChange,
  onCancel,
  onConfirm,
  exportReady = false,
  onShare,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  exportReady?: boolean;
  onShare?: () => void;
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
        <div
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            fontWeight: 700,
            color: OVB_BLUE,
          }}
        >
          Namen der Person eingeben
        </div>

        {!exportReady && (
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="z. B. Max Mustermann"
            style={{
              padding: "clamp(8px, 2.5vw, 10px) clamp(10px, 3vw, 12px)",
              borderRadius: "8px",
              border: `1px solid ${OVB_BLUE}`,
              fontSize: "clamp(14px, 2.5vw, 15px)",
              fontWeight: 700,
              color: OVB_BLUE,
              outline: "none",
            }}
          />
        )}

        {exportReady && (
          <div
            style={{
              fontSize: "clamp(14px, 2.5vw, 15px)",
              color: OVB_BLUE,
              fontWeight: 600,
            }}
          >
            PDF wurde erstellt.  
            Jetzt teilen oder speichern.
          </div>
        )}

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
              background: "transparent",
              border: "none",
              color: OVB_BLUE,
              fontSize: "clamp(13px, 2.5vw, 14px)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Schließen
          </button>

          {!exportReady && (
            <button
              onClick={onConfirm}
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
              Exportieren
            </button>
          )}

          {exportReady && onShare && (
            <button
              onClick={onShare}
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
              PDF teilen / speichern
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
