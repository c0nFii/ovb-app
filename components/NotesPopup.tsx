"use client";

import { useNotes } from "@/components/layout/NotesContext";

export default function NotesPopup({
  onClose,
}: {
  onClose: () => void;
}) {
  const { notes, updateText } = useNotes();

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: 20,
        width: "40%",
        height: "87%",
        background: "white",
        borderRadius: 12,
        padding: 3,
        zIndex: 99999,
        boxShadow: "0 8px 16px rgb(0, 43, 92)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* 🟦 TEXTFELD */}
      <div
        style={{
          flex: 1,
          borderRadius: 10,
          border: "3px solid rgba(0, 43, 92, 0.8)",
          padding: 10,
        }}
      >
        <textarea
          value={notes.text}
          onChange={(e) => updateText(e.target.value)}
          style={{
            width: "100%",
            height: "100%",
            fontSize: 16,
            fontWeight: 600,
            resize: "none",
            border: "none",
            outline: "none",
            color: "rgba(0, 43, 92, 0.8)",
          }}
        />
      </div>

      {/* 🔵 SCHLIESSEN */}
      <button
        onClick={onClose}
        style={{
          alignSelf: "flex-end",
          marginRight: 10,
          marginBottom: 10,
          padding: "6px 14px",
          backgroundColor: "rgba(0, 43, 92, 0.8)",
          color: "#ffffff",
          fontSize: 14,
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
        }}
      >
        Schließen
      </button>
    </div>
  );
}
