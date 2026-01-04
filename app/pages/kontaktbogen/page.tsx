"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import { exportEmpfehlungen } from "@/components/export/exportEmpfehlungen";
import ExportArea from "@/components/export/ExportArea";

const OVB_BLUE = "#013F72";

type Person = {
  name: string;
  ort: string;
  alter: string;
  beruf: string;
  telefon: string;
  bemerkung: string;
};

export default function KontaktbogenPage() {
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("normal");

  const [isExporting, setIsExporting] = useState(false);

  const [personen, setPersonen] = useState<Person[]>(
    Array.from({ length: 12 }, () => ({
      name: "",
      ort: "",
      alter: "",
      beruf: "",
      telefon: "",
      bemerkung: "",
    }))
  );

  const [page, setPage] = useState<1 | 2>(1);

  /* ===== NEU: Name-Dialog ===== */
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [geberName, setGeberName] = useState("");

  const handleSave = () => {
    setShowNameDialog(true);
  };

  const confirmExport = async () => {
    if (!geberName.trim()) return;

    setShowNameDialog(false);
    setMode("normal");
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 150));

    await exportEmpfehlungen({
      name: geberName,
      empfehlungen: personen.filter((p) => p.name.trim() !== ""),
    });

    setIsExporting(false);
  };

  const updateField =
    (index: number, field: keyof Person) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setPersonen((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    };

  const startIndex = page === 1 ? 0 : 6;
  const visible = personen.slice(startIndex, startIndex + 6);

  return (
    <>
      <TopBar mode={mode} setMode={setMode} onSave={handleSave} />

      {/* ===== UI ===== */}
      <AppScreenWrapper>
        <DrawingSVG mode={mode} />
        <KontaktbogenForm
          personen={visible}
          offset={startIndex}
          updateField={updateField}
          showNavigation
          page={page}
          setPage={setPage}
        />
      </AppScreenWrapper>

      {/* ===== EXPORT (NUR BEIM EXPORT) ===== */}
      {isExporting && (
        <ExportArea>
          <KontaktbogenForm
            personen={personen}
            offset={0}
            updateField={updateField}
            exportMode
          />
        </ExportArea>
      )}

      {/* ===== NAME DES EMPFEHLUNGSGEBERS ===== */}
      {showNameDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px",
              borderRadius: "14px",
              width: "360px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: OVB_BLUE,
              }}
            >
              Name des Empfehlungsgebers
            </div>

            <input
              autoFocus
              value={geberName}
              onChange={(e) => setGeberName(e.target.value)}
              placeholder="z. B. Max Mustermann"
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${OVB_BLUE}`,
                fontSize: "15px",
                fontWeight: 700,
                color: OVB_BLUE,
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                onClick={() => setShowNameDialog(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: OVB_BLUE,
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>

              <button
                onClick={confirmExport}
                style={{
                  background: OVB_BLUE,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Exportieren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= FORM ================= */

function KontaktbogenForm({
  personen,
  offset,
  updateField,
  exportMode = false,
  showNavigation = false,
  page,
  setPage,
}: {
  personen: Person[];
  offset: number;
  updateField: (index: number, field: keyof Person) => any;
  exportMode?: boolean;
  showNavigation?: boolean;
  page?: 1 | 2;
  setPage?: (p: 1 | 2) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        padding: exportMode ? "40px" : "clamp(20px, 5vh, 40px)",
        paddingTop: exportMode ? "80px" : "clamp(50px, 10vh, 80px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: "min-content",
          alignItems: "start",
          gap: exportMode ? "20px" : "clamp(14px, 2vh, 20px)",
        }}
      >
        {personen.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: exportMode ? "8px 6px" : "6px 4px",
            }}
          >
            <Field exportMode={exportMode} label="Name" value={p.name} onChange={updateField(offset + i, "name")} />
            <Field exportMode={exportMode} label="Ort" value={p.ort} onChange={updateField(offset + i, "ort")} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <Field exportMode={exportMode} label="Alter" value={p.alter} onChange={updateField(offset + i, "alter")} />
              <Field exportMode={exportMode} label="Beruf" value={p.beruf} onChange={updateField(offset + i, "beruf")} />
            </div>

            <Field exportMode={exportMode} label="Telefon" value={p.telefon} onChange={updateField(offset + i, "telefon")} />
            <Field exportMode={exportMode} label="Bemerkung" value={p.bemerkung} onChange={updateField(offset + i, "bemerkung")} multiline />
          </div>
        ))}
      </div>

      {showNavigation && page && setPage && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "20px" }}>
          <NavDot active={page === 1} onClick={() => setPage(1)} />
          <NavDot active={page === 2} onClick={() => setPage(2)} />
        </div>
      )}
    </div>
  );
}

/* ================= UI HELPERS ================= */

function NavDot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: active ? OVB_BLUE : "transparent",
        border: `2px solid ${OVB_BLUE}`,
        cursor: "pointer",
      }}
    />
  );
}

function Field({
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
    padding: exportMode ? "8px 8px" : "6px 8px",
    borderRadius: "6px",
    border: `1px solid ${OVB_BLUE}`,
    fontSize: exportMode ? "14px" : "clamp(12px, 1.2vw, 14px)",
    lineHeight: exportMode ? "1.4" : undefined,
    background: "rgba(255,255,255,0.95)",
    outline: "none",
    color: OVB_BLUE,
  };

  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontSize: exportMode ? "13px" : "clamp(11px, 1.1vw, 13px)",
        lineHeight: exportMode ? "1.2" : undefined,
        fontWeight: 500,
        color: OVB_BLUE,
      }}
    >
      {label}
      {multiline ? (
        <textarea value={value} onChange={onChange} rows={2} style={{ ...baseStyle, resize: "none" }} />
      ) : (
        <input value={value} onChange={onChange} style={baseStyle} />
      )}
    </label>
  );
}
