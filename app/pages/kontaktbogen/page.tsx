"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import ExportArea from "@/components/export/ExportArea";
import KontaktbogenForm from "./KontaktbogenForm";
import NameDialog from "./NameDialog";
import LaserPointer from "@/components/presentation/LaserPointer";

import "./kontaktbogen.css";

export const OVB_BLUE = "#013F72";

export type Person = {
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
  const [page, setPage] = useState<1 | 2>(1);

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

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [geberName, setGeberName] = useState("");

  const handleSave = () => setShowNameDialog(true);

  /* =========================
     EXPORT (SERVER → URL)
     ========================= */

  const confirmExport = async () => {
    if (!geberName.trim()) return;

    setMode("normal");
    setIsExporting(true);

    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "empfehlungen",
        name: geberName,
        empfehlungen: personen.filter((p) => p.name.trim() !== ""),
      }),
    });

    setIsExporting(false);
    setShowNameDialog(false);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 📱 Mobile → Share (nur HTTPS!)
    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({
          url,
          title: `Empfehlungen ${geberName}`,
        });
        return;
      } catch {
        // Abbruch → Download
      }
    }

    // 🖥 Desktop / Fallback → Download
    const a = document.createElement("a");
    a.href = url;
    a.download = `Empfehlungen-${geberName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* =========================
     FORM UPDATE
     ========================= */

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

  return (
    <>
      <TopBar mode={mode} setMode={setMode} onSave={handleSave} />
<LaserPointer mode={mode} />
      <AppScreenWrapper>
        <div className="kontaktbogen-stage">
          <DrawingSVG
  active={mode === "draw" || mode === "erase"}
  erase={mode === "erase"}
/>


          <KontaktbogenForm
            personen={personen.slice(startIndex, startIndex + 6)}
            offset={startIndex}
            updateField={updateField}
            page={page}
            setPage={setPage}
            showNavigation
          />
        </div>
      </AppScreenWrapper>

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

      {showNameDialog && (
        <NameDialog
          value={geberName}
          onChange={setGeberName}
          onCancel={() => setShowNameDialog(false)}
          onConfirm={confirmExport}
        />
      )}
    </>
  );
}
