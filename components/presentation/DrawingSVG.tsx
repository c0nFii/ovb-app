"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { usePen } from "../layout/PenContext";

/* =========================
   TYPES
   ========================= */

export type Path = {
  d: string;
  color: string;
  width: number;
};

type Point = { x: number; y: number };

/* =========================
   HELPERS
   ========================= */

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* =========================
   COMPONENT
   ========================= */

export default function DrawingSVG({
  active,
  erase,
  paths,
  setPaths,
}: {
  active: boolean;
  erase: boolean;
  paths: Path[];
  setPaths: React.Dispatch<React.SetStateAction<Path[]>>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPoint = useRef<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);

  // Container-Größe für viewBox
  const [size, setSize] = useState({ width: 1920, height: 1080 });

  const { color, width } = usePen();

  /* =========================
     CONTAINER-GRÖSSE MESSEN
     ========================= */

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSize({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
    };

    updateSize();
    setTimeout(updateSize, 100);

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  /* =========================
     KOORDINATEN
     ========================= */

  const getPoint = useCallback((e: React.PointerEvent | PointerEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };

    const svgPoint = pt.matrixTransform(screenCTM.inverse());

    return {
      x: Math.round(svgPoint.x * 100) / 100,
      y: Math.round(svgPoint.y * 100) / 100
    };
  }, []);

  const isPointNearPath = useCallback((point: Point, path: Path, radius = 15) => {
    const segments = path.d.split(/[ML]\s*/).filter(Boolean);
    const points = segments.map((seg) => {
      const coords = seg.trim().split(/\s+/).map(Number);
      return { x: coords[0], y: coords[1] };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));

    return points.some((p) => distance(p, point) < radius);
  }, []);

  /* =========================
     MAUS/TOUCH CLICK WEITERLEITUNG
     ========================= */

  const forwardEventToElementBelow = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;

    // SVG kurz deaktivieren
    svg.style.pointerEvents = "none";

    // Element darunter finden
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);

    if (elementBelow && elementBelow !== svg) {
      // Für Input-Felder: Fokus setzen und SVG länger deaktiviert lassen
      if (elementBelow instanceof HTMLInputElement ||
          elementBelow instanceof HTMLTextAreaElement ||
          elementBelow instanceof HTMLSelectElement) {
        elementBelow.focus();
        // SVG für 500ms deaktiviert lassen, damit Tastatur sich stabilisieren kann
        setTimeout(() => {
          svg.style.pointerEvents = "auto";
        }, 500);
        return;
      }

      // Für andere Elemente: Click Event weiterleiten
      elementBelow.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: e.clientX,
        clientY: e.clientY,
      }));
    }

    // SVG sofort wieder aktivieren (außer bei Inputs)
    svg.style.pointerEvents = "auto";
  }, []);

  /* =========================
     POINTER EVENTS - NUR PEN auf SVG
     ========================= */

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Nicht-Stift Events weiterleiten
    if (e.pointerType !== "pen") {
      forwardEventToElementBelow(e);
      return;
    }

    if (!active) return;

    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const p = getPoint(e);
    lastPoint.current = p;

    if (!erase) {
      setCurrentPath({ d: `M ${p.x} ${p.y}`, color, width });
    } else {
      setPaths((prev) => prev.filter((path) => !isPointNearPath(p, path)));
    }
  }, [active, erase, color, width, getPoint, isPointNearPath, setPaths, forwardEventToElementBelow]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Nur Stift-Events verarbeiten
    if (e.pointerType !== "pen") return;
    if (!active || !lastPoint.current) return;

    e.preventDefault();
    e.stopPropagation();

    const p = getPoint(e);

    if (distance(p, lastPoint.current) < 1) return;

    lastPoint.current = p;

    if (!erase) {
      setCurrentPath((prev) =>
        prev ? { ...prev, d: `${prev.d} L ${p.x} ${p.y}` } : prev
      );
    } else {
      setPaths((prev) => prev.filter((path) => !isPointNearPath(p, path)));
    }
  }, [active, erase, getPoint, isPointNearPath, setPaths]);

  const handlePointerEnd = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Nicht-Stift Events ignorieren (wurden bei PointerDown schon weitergeleitet)
    if (e.pointerType !== "pen") {
      return;
    }

    if (!active) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!erase && currentPath && currentPath.d.includes("L")) {
      setPaths((prev) => [...prev, currentPath]);
    }

    lastPoint.current = null;
    setCurrentPath(null);
  }, [active, erase, currentPath, setPaths]);

  /* =========================
     RENDER
     ========================= */

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            touchAction: "none",
            pointerEvents: "auto", // Empfängt alle Events, leitet Nicht-Stift weiter
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={p.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {currentPath && !erase && (
          <path
            d={currentPath.d}
            fill="none"
            stroke={currentPath.color}
            strokeWidth={currentPath.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}