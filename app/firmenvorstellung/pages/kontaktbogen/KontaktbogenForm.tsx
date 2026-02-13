import { Person } from "./kontaktbogenShared";
import { Field, NavDot } from "./KontaktbogenFields";

export default function KontaktbogenForm({
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
        /* ⬇️ Platz für FIXED TopBar */
        paddingTop: exportMode
          ? "100px"
          : "calc(80px + env(safe-area-inset-top))",

        paddingLeft: exportMode ? "40px" : "clamp(18px, 4vh, 32px)",
        paddingRight: exportMode ? "40px" : "clamp(18px, 4vh, 32px)",
        paddingBottom: exportMode ? "40px" : "clamp(18px, 4vh, 32px)",
      }}
    >
        {/* ===== PERSONEN GRID ===== */
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: exportMode ? "20px" : "clamp(6px, 1.5vh, 18px)",
        }}
      >
        {personen.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: exportMode
                ? "transparent"
                : "rgba(1,63,114,0.04)",
            }}
          >
            <Field
              label="Name"
              value={p.name}
              onChange={updateField(offset + i, "name")}
              exportMode={exportMode}
            />

            <Field
              label="Ort"
              value={p.ort}
              onChange={updateField(offset + i, "ort")}
              exportMode={exportMode}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              <Field
                label="Alter"
                value={p.alter}
                onChange={updateField(offset + i, "alter")}
                exportMode={exportMode}
              />

              <Field
                label="Beruf"
                value={p.beruf}
                onChange={updateField(offset + i, "beruf")}
                exportMode={exportMode}
              />
            </div>

            <Field
              label="Telefon"
              value={p.telefon}
              onChange={updateField(offset + i, "telefon")}
              exportMode={exportMode}
            />

            <Field
              label="Bemerkung"
              value={p.bemerkung}
              onChange={updateField(offset + i, "bemerkung")}
              multiline
              exportMode={exportMode}
            />
          </div>
        ))}
      </div>
}
      {/* ===== PAGE NAVIGATION ===== */}
      {showNavigation && page && setPage && (
        <div
          style={{
            marginTop: "clamp(24px, 4vh, 36px)",
            display: "flex",
            justifyContent: "center",
            gap: "18px",
          }}
        >
          <NavDot active={page === 1} onClick={() => setPage(1)} />
          <NavDot active={page === 2} onClick={() => setPage(2)} />
        </div>
      )}
    </div>
  );
}
