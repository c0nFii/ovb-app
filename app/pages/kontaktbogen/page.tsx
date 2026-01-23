"use client";

import { useState, useRef } from "react";
import AppScreenWrapper from "@/components/AppScreenWrapper";
import TopBar from "@/components/layout/TopBar";
import DrawingSVG from "@/components/presentation/DrawingSVG";
import ExportArea from "@/components/export/ExportArea";
import KontaktbogenForm from "./KontaktbogenForm";
import NameDialog from "./NameDialog";
import { NothingToExportDialog } from "@/components/export/NothingToExport";
import LaserPointer from "@/components/presentation/LaserPointer";
import DrawingOverlay from "@/components/presentation/DrawingOverlay";
import { exportKontaktbogenToPDF } from "@/components/export/exportController";
import { useNotes } from "@/components/layout/NotesContext";
import { CleanupDialog } from "@/components/export/cleanUpDialog";

import "./kontaktbogen.css";

export const OVB_BLUE = "#013F72";

/* =========================
   TYPES
   ========================= */

export type Person = {
  name: string;
  ort: string;
  alter: string;
  beruf: string;
  telefon: string;
  bemerkung: string;
};

export type Path = {
  d: string;
  color: string;
  width: number;
};

/* =========================
   PAGE
   ========================= */

export default function KontaktbogenPage() {
  const [mode, setMode] =
    useState<"normal" | "draw" | "erase" | "laser">("draw");

  const [page, setPage] = useState<1 | 2>(1);
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

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [showNothingDialog, setShowNothingDialog] = useState(false);
  const [geberName, setGeberName] = useState("");

  const [drawingPaths, setDrawingPaths] = useState<Path[]>([]);

  const { notes, updateText } = useNotes();

  /* =========================
     FORM
     ========================= */

  const startIndex = page === 1 ? 0 : 6;

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

  /* =========================
     EXPORT (GUARD!)
     ========================= */

  const handleSave = () => {
    const hasNotes = Boolean(notes.text && notes.text.trim().length > 0);
    const hasPersons = personen.some((p) => p.name.trim() !== "");

    if (!hasNotes && !hasPersons) {
      setShowNothingDialog(true);
      return;
    }

    setShowNameDialog(true);
  };

  const confirmExport = async () => {
    if (!geberName.trim()) return;

    setMode("normal");
    setIsExporting(true);

    try {
      // Optional: kurz loggen, was wir exportieren (hilft beim Debug)
      console.log("Export start:", {
        geberName,
        personsCount: personen.filter((p) => p.name.trim() !== "").length,
        notesLength: notes.text?.length ?? 0,
      });

      await exportKontaktbogenToPDF({
        geberName,
        personen: personen.filter((p) => p.name.trim() !== ""),
        notes: notes.text,
        onCleanupDialog: setShowCleanupDialog,
      });
    } catch (err) {
  try {
    // 1) Wenn es ein Error ist, zeig message + stack
    if (err instanceof Error) {
      console.error("Export failed (Error):", err.message, err.stack);
      return;
    }

    // 2) Wenn es ein DOMException (z.B. tainted canvas) ist
    if (typeof DOMException !== "undefined" && err instanceof DOMException) {
      console.error("Export failed (DOMException):", err.name, err.message, err.code);
      return;
    }

    // 3) Wenn es ein Event‑like Objekt (isTrusted) ist
    if (err && typeof err === "object" && "isTrusted" in err) {
      console.error("Export failed (Event-like):", {
        type: (err as any).type,
        isTrusted: (err as any).isTrusted,
        detail: (err as any).detail ?? null,
      });
      console.dir(err);
      return;
    }

    // 4) Fallback: versuche zu serialisieren
    let serialized = "";
    try {
      serialized = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
    } catch {
      serialized = String(err);
    }
    console.error("Export failed (non-Error):", serialized);
    console.dir(err);
  } catch (logErr) {
    console.error("Export failed and logging failed:", logErr);
  }


    } finally {
      setIsExporting(false);
      setShowNameDialog(false);
    }
  };

  /* =========================
     CLEANUP
     ========================= */

  const handleCleanup = () => {
    setPersonen(
      Array.from({ length: 12 }, () => ({
        name: "",
        ort: "",
        alter: "",
        beruf: "",
        telefon: "",
        bemerkung: "",
      }))
    );
    updateText("");
    setDrawingPaths([]);
    setGeberName("");
    setShowCleanupDialog(false);
  };

  /* =========================
     SWIPE NAVIGATION
     ========================= */

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 60) return;

    if (dx < 0 && page === 1) setPage(2);
    if (dx > 0 && page === 2) setPage(1);

    touchStartX.current = null;
    touchStartY.current = null;
  };

  /* =========================
     RENDER
     ========================= */

  return (
    <>
      <TopBar mode={mode} setMode={setMode} onSave={handleSave} />
      <LaserPointer mode={mode} />

      <AppScreenWrapper>
        <div
          className="kontaktbogen-stage"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DrawingOverlay active={mode !== "laser"}>
            <DrawingSVG
              active={mode !== "laser"}
              erase={mode === "erase"}
              paths={drawingPaths}
              setPaths={setDrawingPaths}
            />
          </DrawingOverlay>

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

      {showNothingDialog && (
        <NothingToExportDialog
          onClose={() => setShowNothingDialog(false)}
        />
      )}

      {showCleanupDialog && (
        <CleanupDialog
          onConfirm={handleCleanup}
          onCancel={() => setShowCleanupDialog(false)}
        />
      )}
    </>
  );
}
