"use client";

import { useState } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import { exportEmpfehlungen } from "@/components/export/exportEmpfehlungen";
import ExportArea from "@/components/export/ExportArea";
import KontaktbogenForm from "./KontaktbogenForm";
import NameDialog from "./NameDialog";

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
     EXPORT + SOFORT TEILEN
     ========================= */

  const confirmExport = async () => {
    if (!geberName.trim()) return;

    setMode("normal");
    setIsExporting(true);

    const { fileName, blob } = await exportEmpfehlungen({
      name: geberName,
      empfehlungen: personen.filter((p) => p.name.trim() !== ""),
    });

    setIsExporting(false);
    setShowNameDialog(false);

    const file = new File([blob], fileName, {
      type: "application/pdf",
    });

    // 📱 iOS / Android → Share Sheet
    if (navigator.share) {
      await navigator.share({
        files: [file],
        title: fileName,
      });
      return;
    }

    // 🖥 Desktop → Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
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

      <AppScreenWrapper>
        <div className="kontaktbogen-stage">
          <DrawingSVG mode={mode} />

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
