"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Path } from "@/components/presentation/DrawingSVG";

type NotesData = {
  text: string;
  drawing: Path[];
};

type NotesContextValue = {
  notes: NotesData;
  updateText: (text: string) => void;
  updateDrawing: (drawing: Path[]) => void;
};

const STORAGE_KEY = "ovb-global-notes";

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NotesData>({
    text: "",
    drawing: [],
  });

  // 🔹 Load once (defensiv & schema‑sicher)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      setNotes({
        text: typeof parsed.text === "string" ? parsed.text : "",
        drawing: Array.isArray(parsed.drawing) ? parsed.drawing : [],
      });
    } catch {
      // corrupted storage → ignore
    }
  }, []);

  // 🔹 Save on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const updateText = (text: string) =>
    setNotes((prev) => ({ ...prev, text }));

  const updateDrawing = (drawing: Path[]) =>
    setNotes((prev) => ({ ...prev, drawing }));

  return (
    <NotesContext.Provider value={{ notes, updateText, updateDrawing }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotes must be used inside NotesProvider");
  }
  return ctx;
}
