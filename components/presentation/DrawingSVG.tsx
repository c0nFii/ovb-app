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
  const lastPoint = useRef<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  
  // Dynamische viewBox basierend auf Container-Größe
  const [viewBox, setViewBox] = useState({ width: 1920, height: 1080 });

  const { color, width } = usePen();

  /* =========================
     VIEWBOX DYNAMISCH ANPASSEN
     ========================= */

  useEffect(() => {
    const updateViewBox = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setViewBox({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
    };

    updateViewBox();
    const timeout = setTimeout(updateViewBox, 100);

    window.addEventListener("resize", updateViewBox);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateViewBox);
    };
  }, []);

  /* =========================
     KOORDINATEN TRANSFORMATION
     ========================= */

  const getPoint = useCallback((e: React.PointerEvent): Point => {
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
     POINTER EVENTS - NUR PEN!
     ========================= */

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // 🔴 NUR Stylus/Pen erlauben - KEIN Touch/Finger!
    if (!active || e.pointerType !== "pen") return;

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
  }, [active, erase, color, width, getPoint, isPointNearPath, setPaths]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active || e.pointerType !== "pen" || !lastPoint.current) return;

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
    if (!active || e.pointerType !== "pen") return;

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
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        touchAction: "none",
        pointerEvents: active ? "auto" : "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
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
  );
}