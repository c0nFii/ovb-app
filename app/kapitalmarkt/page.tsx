"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function KapitalmarktPage() {
  const [clicked, setClicked] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const [mode, setMode] = useState<"normal" | "draw" | "erase" | "laser">("normal");

  const [showNextTrigger, setShowNextTrigger] = useState(true);
  const [showLeftTrigger, setShowLeftTrigger] = useState(false);
  const [showLeftInfo, setShowLeftInfo] = useState(false);
  const [showRightTrigger, setShowRightTrigger] = useState(false);
  const [showRightInfo, setShowRightInfo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);

  const laserRef = useRef<HTMLDivElement | null>(null);

  const images = [
    "bank.png",
    "vers.png",
    "bsk.png",
    "invest.png",
    "immo.png",
    "staat.png",
    "v.png",
    "ovb.png",
  ];

  const isOVB = imageIndex >= images.indexOf("ovb.png");

  const handleNext = () => {
    if (imageIndex < images.length - 1) {
      setShowNextTrigger(false);
      setImageIndex((prev) => prev + 1);
      setTimeout(() => setShowNextTrigger(true), 2000);
    }
  };

  useEffect(() => {
    if (isOVB) {
      setShowNextTrigger(false);
      setTimeout(() => setShowLeftTrigger(true), 2000);
    }
  }, [isOVB]);
  const handleLeftClick = () => {
    setShowLeftInfo(true);
    setShowLeftTrigger(false);
    setTimeout(() => setShowRightTrigger(true), 2000);
  };

  const handleRightClick = () => {
    setShowRightInfo(true);
    setShowRightTrigger(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  const rect = parent.getBoundingClientRect();

  canvas.width = parent.offsetWidth;
canvas.height = parent.offsetHeight;


  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#002b5c";
  ctx.lineWidth = 4;

  ctxRef.current = ctx;
};


    setTimeout(resize, 50);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [clicked]);

  const getPos = (e: MouseEvent | TouchEvent, rect: DOMRect) => {
    if (e instanceof TouchEvent) {
      const t = e.touches[0] || e.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  const startDrawing = (e: any) => {
  if (mode !== "draw" && mode !== "erase") return;

  const canvas = canvasRef.current;
  const ctx = ctxRef.current;
  if (!canvas || !ctx) return;

  drawing.current = true;

  ctx.globalCompositeOperation =
    mode === "erase" ? "destination-out" : "source-over";

  ctx.lineWidth = mode === "erase" ? 30 : 4;

  const rect = canvas.getBoundingClientRect();
  const { x, y } = getPos(e.nativeEvent, rect);

  ctx.beginPath();
  ctx.moveTo(x, y);
};

  const draw = (e: any) => {
  if (!drawing.current) return;

  const canvas = canvasRef.current;
  const ctx = ctxRef.current;
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const { x, y } = getPos(e.nativeEvent, rect);

  ctx.lineTo(x, y);
  ctx.stroke();
};

  const stopDrawing = () => {
    drawing.current = false;
  };
  useEffect(() => {
    const laser = laserRef.current;
    if (!laser) return;

    if (mode === "laser") {
      document.body.style.cursor = "none";
    } else {
      document.body.style.cursor = "default";
      laser.style.display = "none";
      return;
    }

    const move = (e: MouseEvent) => {
      laser.style.display = "block";
      laser.style.left = e.clientX - 20 + "px";
      laser.style.top = e.clientY - 20 + "px";
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mode]);
  const savePDF = async () => {
  const exportEl = document.getElementById("export-area");
  if (!exportEl) return;

  const canvas = await html2canvas(exportEl, {
    scale: 1,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("landscape", "mm", "a4");

  pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
  pdf.save("Firmenvorstellung.pdf");
};


  return (
    <div className="relative min-h-screen bg-white">

      {/* LASERPOINTER */}
      <div
        ref={laserRef}
        style={{
          position: "fixed",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 999999,
          background: "radial-gradient(circle, #002b5c 0%, #4fa3e3 70%, transparent 100%)",
          display: "none",
        }}
      />

      {/* Navigation */}
      <div className="absolute top-0 left-0 w-full bg-white bg-opacity-80 py-2 z-[9999]">
        <div className="max-w-20xl mx-auto grid grid-cols-3 items-center px-6 text-[#002b5c]">

          {/* LINKS: Home */}
          <div className="flex justify-start">
            <a href="/">
              <Image
                src="/home-icon.png"
                alt="Startseite"
                width={60}
                height={60}
                className="transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg cursor-pointer"
              />
            </a>
          </div>

          {/* MITTE: Canvas Icons */}
          <div className="flex justify-center gap-4">

            {/* Stift */}
            <Image
              src="/icons/stift.png"
              alt="Stift"
              width={40}
              height={40}
              onClick={() => setMode("draw")}
              className={`cursor-pointer transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg ${
                mode === "draw" ? "scale-125 drop-shadow-xl" : ""
              }`}
            />

            {/* Radierer */}
            <Image
              src="/icons/radierer.png"
              alt="Radierer"
              width={40}
              height={40}
              onClick={() => setMode("erase")}
              className={`cursor-pointer transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg ${
                mode === "erase" ? "scale-125 drop-shadow-xl" : ""
              }`}
            />

            {/* Laserpointer */}
            <Image
              src="/icons/laserpointer.png"
              alt="Laserpointer"
              width={40}
              height={40}
              onClick={() => setMode("laser")}
              className={`cursor-pointer transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg ${
                mode === "laser" ? "scale-125 drop-shadow-xl" : ""
              }`}
            />

            {/* Normalmodus */}
            <Image
              src="/icons/normalmodus.png"
              alt="Normalmodus"
              width={40}
              height={40}
              onClick={() => setMode("normal")}
              className={`cursor-pointer transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg ${
                mode === "normal" ? "scale-125 drop-shadow-xl" : ""
              }`}
            />

            {/* Save */}
            <Image
              src="/icons/save.png"
              alt="Speichern"
              width={40}
              height={40}
              onClick={savePDF}
              className="cursor-pointer transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg"
            />
          </div>

          {/* RECHTS: Zurück, Refresh, Weiter */}
          <div className="flex justify-end gap-4">
            <button onClick={() => window.history.back()}>
              <Image
                src="/icons/arrow-left.png"
                alt="Zurück"
                width={50}
                height={50}
                className="transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg cursor-pointer"
              />
            </button>

            <button onClick={() => window.location.reload()}>
              <Image
                src="/icons/refresh-icon.png"
                alt="Neu laden"
                width={50}
                height={50}
                className="transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg cursor-pointer"
              />
            </button>

            <a href="/lebensplan">
              <Image
                src="/icons/arrow-right.png"
                alt="Weiter"
                width={50}
                height={50}
                className="transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg cursor-pointer"
              />
            </a>
          </div>

        </div>
      </div>
      {/* Hauptbereich */}
      <div className="w-full h-screen flex items-center justify-center relative">

        {/* Start-Kreis */}
        {!clicked && (
          <div
            className="cursor-pointer z-[999]"
            onClick={() => {
              setClicked(true);
              setShowNextTrigger(false);
              setTimeout(() => setShowNextTrigger(true), 2000);
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                border: "6px solid #002b5c",
                animation: "ring 2s infinite",
              }}
            />
          </div>
        )}

        {/* Bilder + Logik */}
        {clicked && (
  <div className="relative w-full flex items-center justify-center z-30">

    {/* EXPORT-WRAPPER (PRINT-FIX) */}
<div
  id="export-area"
  className="relative flex items-center justify-center bg-white"
  style={{
    width: "1123px",
    height: "794px",
  }}
>



      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 999999,
          pointerEvents: mode === "draw" || mode === "erase" ? "auto" : "none",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

     {/* Bilder */}
<div className="absolute inset-0 z-[1]">
  {images.slice(0, imageIndex + 1).map((img, i) => {
    const isV = img === "v.png";
    const isOVBimg = img === "ovb.png";

    // gewünschter Skalierungsfaktor
    const scale = isOVBimg || isV ? 0.2 : 1;

    return (
      <div
        key={i}
        className={`absolute inset-0 flex items-center justify-center ${
          isOVBimg ? "reveal-left" : ""
        }`}
        style={{
          zIndex: i,
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
      >
        <div className="absolute inset-0">
          <img
            src={`/${img}`}
            alt=""
            className="w-full h-full object-contain select-none premium-image"
          />
        </div>
      </div>
    );
  })}
</div>



      {/* Weiter-Kreis / Rufzeichen / Texte bleiben UNVERÄNDERT */}
      {/* Einfach unterhalb weiterlaufen lassen */}


              {/* Weiter-Kreis */}
              {!isOVB && showNextTrigger && (
                <div
                  className="cursor-pointer z-[50]"
                  onClick={handleNext}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 220,
                      height: 220,
                      borderRadius: "80%",
                      border: "6px solid #002b5c",
                      animation: "ring 2s infinite",
                    }}
                  />
                </div>
              )}

              {/* Linkes Rufzeichen */}
              {isOVB && showLeftTrigger && !showLeftInfo && (
                <div
                  className="cursor-pointer z-[200] text-[#002b5c] text-6xl font-bold"
                  onClick={handleLeftClick}
                  style={{
                    position: "absolute",
                    left: "-8vw",
                    top: "50%",
                    transform: "translateY(-50%)",
                    animation: "ring 2s infinite",
                  }}
                >
                  !
                </div>
              )}

              {/* Linker Text */}
              {showLeftInfo && (
                <div
                  className="absolute left-[-6vw] top-[10%] -translate-y-1/2 z-[210] text-[#002b5c] text-3xl font-semibold fade-in"
                >
                  Kein eigenes Produkt
                </div>
              )}

              {/* Rechtes Rufzeichen */}
              {showLeftInfo && showRightTrigger && !showRightInfo && (
                <div
                  className="cursor-pointer z-[200] text-[#002b5c] text-6xl font-bold"
                  onClick={handleRightClick}
                  style={{
                    position: "absolute",
                    right: "-8vw",
                    bottom: "10%",
                    animation: "ring 2s infinite",
                  }}
                >
                  !
                </div>
              )}

              {/* Rechter Text */}
              {showRightInfo && (
                <div
                  className="absolute right-[-6vw] bottom-[10%] z-[210] text-[#002b5c] text-3xl font-semibold fade-in"
                >
                  seit 2006 TÜV geprüft
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .premium-image {
          animation: fadeInPremium 1.2s ease forwards;
          filter: drop-shadow(0 0 18px rgba(0, 0, 0, 0.18));
        }

        @keyframes fadeInPremium {
          0% { opacity: 0; transform: scale(0.92); filter: blur(14px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }

        .fade-in {
          animation: fadeText 1s ease forwards;
        }

        @keyframes fadeText {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
