"use client";

import { useRef, useState } from "react";

type Mode = "normal" | "draw" | "erase" | "laser";

type Path = { d: string };
type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function DrawingSVG({ mode }: { mode: Mode }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lastPoint = useRef<Point | null>(null);

  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);

  /* ======================================================
     KOORDINATEN – SVG-RAUM, TRANSFORM-SICHER
     ====================================================== */

  const getPoint = (e: React.PointerEvent): Point => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();

    pt.x = e.clientX;
    pt.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };

    const local = pt.matrixTransform(screenCTM.inverse());
    return { x: local.x, y: local.y };
  };

  /* ======================================================
     HIT-TEST – RADIERER
     ====================================================== */

  const isPointNearPath = (
    point: Point,
    path: Path,
    radius = 12
  ) => {
    const points = path.d
      .split("L")
      .map((cmd) =>
        cmd
          .replace("M", "")
          .trim()
          .split(" ")
          .map(Number)
      )
      .map(([x, y]) => ({ x, y }));

    return points.some((p) => distance(p, point) < radius);
  };

  /* ======================================================
     START – NUR STYLUS
     ====================================================== */

  const start = (e: React.PointerEvent) => {
    if (e.pointerType !== "pen") return;
    if (mode !== "draw" && mode !== "erase") return;

    e.preventDefault();
    e.stopPropagation();

    const p = getPoint(e);
    lastPoint.current = p;

    if (mode === "draw") {
      setCurrentPath({ d: `M ${p.x} ${p.y}` });
    }

    if (mode === "erase") {
      setPaths((prev) =>
        prev.filter((path) => !isPointNearPath(p, path))
      );
    }
  };

  /* ======================================================
     MOVE
     ====================================================== */

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "pen") return;
    if (!lastPoint.current) return;

    e.preventDefault();
    e.stopPropagation();

    const p = getPoint(e);
    if (distance(p, lastPoint.current) < 2) return;

    lastPoint.current = p;

    if (mode === "draw") {
      setCurrentPath((prev) =>
        prev ? { d: `${prev.d} L ${p.x} ${p.y}` } : null
      );
    }

    if (mode === "erase") {
      setPaths((prev) =>
        prev.filter((path) => !isPointNearPath(p, path))
      );
    }
  };

  /* ======================================================
     END
     ====================================================== */

  const end = (e: React.PointerEvent) => {
    if (e.pointerType !== "pen") return;

    if (mode === "draw" && currentPath) {
      setPaths((p) => [...p, currentPath]);
    }

    lastPoint.current = null;
    setCurrentPath(null);
  };

  /* ======================================================
     RENDER
     ====================================================== */

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 2560 1440"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        touchAction: "none",
        pointerEvents:
          mode === "draw" || mode === "erase" ? "auto" : "none",
      }}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke="#002b5c"
          strokeWidth={4}          
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {currentPath && (
        <path
          d={currentPath.d}
          fill="none"
          stroke="#002b5c"
          strokeWidth={4}          
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
