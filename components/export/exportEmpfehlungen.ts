import jsPDF from "jspdf";

type Empfehlung = {
  name: string;
  ort: string;
  alter: string;
  beruf: string;
  telefon: string;
  bemerkung: string;
};

type ExportData = {
  name: string;
  empfehlungen: Empfehlung[];
};

export async function exportEmpfehlungen({
  name,
  empfehlungen,
}: ExportData) {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = 210;
  const pageHeight = 297;

  const marginLeft = 20;
  const labelX = 20;
  const valueX = 55;
  const maxY = 270;

  const OVB_BLUE: [number, number, number] = [1, 63, 114];

  const headerY = 30;
  const contentStartY = headerY + 20; // ⬅️ MEHR ABSTAND ZUM ERSTEN NAMEN

  let y = contentStartY;

  /* =========================
     LOGO LADEN
  ========================== */

  const logo = new Image();
  logo.src = "/ovb.png";

  await new Promise<void>((resolve) => {
    logo.onload = () => resolve();
  });

  const logoWidth = 18;
  const logoHeight = (logo.height / logo.width) * logoWidth;

  /* =========================
     FONT HELPERS
  ========================== */

  const setHeaderFont = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(...OVB_BLUE);
  };

  const setContentFont = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...OVB_BLUE); // ⬅️ ALLES IN OVB-BLAU
  };

  /* =========================
     HEADER ZEICHNEN
  ========================== */

  const drawHeader = () => {
    pdf.addImage(
      logo,
      "PNG",
      marginLeft,
      headerY - logoHeight / 2,
      logoWidth,
      logoHeight
    );

    setHeaderFont();
    pdf.text(`Empfehlungen ${name}`, pageWidth / 2, headerY, {
      align: "center",
    });
  };

  /* =========================
     ERSTE SEITE
  ========================== */

  drawHeader();
  setContentFont();

  /* =========================
     INHALT
  ========================== */

  empfehlungen.forEach((e) => {
    if (y > maxY) {
      pdf.addPage();
      drawHeader();
      setContentFont();
      y = contentStartY;
    }

    pdf.setFont("helvetica", "bold");
    pdf.text("Name:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(e.name || "-", valueX, y);
    y += 6;

    if (e.ort) {
      pdf.text("Ort:", labelX, y);
      pdf.text(e.ort, valueX, y);
      y += 5;
    }

    if (e.alter) {
      pdf.text("Alter:", labelX, y);
      pdf.text(e.alter, valueX, y);
      y += 5;
    }

    if (e.beruf) {
      pdf.text("Beruf:", labelX, y);
      pdf.text(e.beruf, valueX, y);
      y += 5;
    }

    if (e.telefon) {
      pdf.text("Telefon:", labelX, y);
      pdf.text(e.telefon, valueX, y);
      y += 5;
    }

    if (e.bemerkung) {
      pdf.text("Bemerkung:", labelX, y);
      const lines = pdf.splitTextToSize(e.bemerkung, 130);
      pdf.text(lines, valueX, y);
      y += lines.length * 5;
    }

    y += 7; // etwas mehr Luft zwischen Empfehlungen
  });

  /* =========================
     SEITENNUMMERIERUNG
  ========================== */

  const pageCount = pdf.getNumberOfPages();

  if (pageCount > 1) {
    pdf.setFontSize(9);
    pdf.setTextColor(...OVB_BLUE);

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(
        `${i}/${pageCount}`,
        pageWidth - 20,
        pageHeight - 15,
        { align: "right" }
      );
    }
  }

  /* =========================
     SAVE
  ========================== */

  pdf.save(`Empfehlungen ${name}.pdf`);
}
