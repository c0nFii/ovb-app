import { OVB_BLUE } from "./kontaktbogenShared";

/* ================= NAVIGATION DOT ================= */

export function NavDot({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: active ? OVB_BLUE : "transparent",
        border: `2px solid ${OVB_BLUE}`,
        cursor: "pointer",
      }}
    />
  );
}

/* ================= FORM FIELD ================= */

export function Field({
  label,
  value,
  onChange,
  multiline,
  exportMode = false,
}: {
  label: string;
  value: string;
  onChange: any;
  multiline?: boolean;
  exportMode?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: exportMode
      ? "8px 8px"
      : "clamp(6px, 1vh, 8px) 8px",
    borderRadius: "6px",
    border: `1px solid ${OVB_BLUE}`,
    fontSize: exportMode
      ? "14px"
      : "clamp(12px, 1.2vw, 13.5px)",
    lineHeight: 1.3,
    background: "rgba(255,255,255,0.96)",
    color: OVB_BLUE,
    outline: "none",
  };

  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontSize: exportMode
          ? "13px"
          : "clamp(11.5px, 1.1vw, 12.5px)",
        fontWeight: 600,
        color: OVB_BLUE,
      }}
    >
      {label}

      {multiline ? (
        <textarea
          rows={1}
          value={value}
          onChange={onChange}
          style={{
            ...baseStyle,
            resize: "none",
          }}
        />
      ) : (
        <input value={value} onChange={onChange} style={baseStyle} />
      )}
    </label>
  );
}
