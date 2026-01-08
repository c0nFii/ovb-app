"use client";

import { createContext, useContext, useEffect, useState } from "react";

type PenContextType = {
  color: string;
  width: number;
  setColor: (c: string) => void;
  setWidth: (w: number) => void;
};

const PenContext = createContext<PenContextType | null>(null);

const STORAGE_KEY = "ovb-pen-settings";

export function PenProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState("#002b5c");
  const [width, setWidth] = useState(4);

  /* =========================
     LOAD FROM LOCAL STORAGE
     ========================= */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed.color) setColor(parsed.color);
      if (parsed.width) setWidth(parsed.width);
    } catch {
      // ignore corrupted storage
    }
  }, []);

  /* =========================
     SAVE TO LOCAL STORAGE
     ========================= */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ color, width })
    );
  }, [color, width]);

  return (
    <PenContext.Provider value={{ color, width, setColor, setWidth }}>
      {children}
    </PenContext.Provider>
  );
}

export function usePen() {
  const ctx = useContext(PenContext);
  if (!ctx) {
    throw new Error("usePen must be used inside PenProvider");
  }
  return ctx;
}
