"use client";

import { useRef, useState } from "react";

type Path = { d: string };
type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function DrawingSVG({
  active,
  erase,
}: {
  active: boolean;
  erase: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lastPoint = useRef<Point | null>(null);

  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);

  const getPoint = (e: React.PointerEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };

    const local = pt.matrixTransform(screenCTM.inverse());
    return { x: local.x, y: local.y };
  };

  const isPointNearPath = (point: Point, path: Path, radius = 12) => {
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

  const start = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    if (e.pointerType !== "pen") return;

    e.preventDefault();
    e.stopPropagation();

    // 🔑 iPad: Pointer Capture
    e.currentTarget.setPointerCapture(e.pointerId);

    const p = getPoint(e);
    lastPoint.current = p;

    if (!erase) {
      setCurrentPath({ d: `M ${p.x} ${p.y}` });
    } else {
      setPaths((prev) => prev.filter((path) => !isPointNearPath(p, path)));
    }
  };

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    if (e.pointerType !== "pen") return;
    if (!lastPoint.current) return;

    e.preventDefault();
    e.stopPropagation();

    const p = getPoint(e);

    // ✏️ iPad: sehr kleine Bewegungen filtern
    if (distance(p, lastPoint.current) < 1) return;

    lastPoint.current = p;

    if (!erase) {
      setCurrentPath((prev) =>
        prev ? { d: `${prev.d} L ${p.x} ${p.y}` } : prev
      );
    } else {
      setPaths((prev) => prev.filter((path) => !isPointNearPath(p, path)));
    }
  };

  const end = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    if (e.pointerType !== "pen") return;

    e.preventDefault();
    e.stopPropagation();

    // 🔑 Pointer Capture wieder freigeben
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!erase && currentPath) {
      setPaths((p) => [...p, currentPath]);
    }

    lastPoint.current = null;
    setCurrentPath(null);
  };

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

        // 🚨 KRITISCH für iPad
        touchAction: "none",
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

      {currentPath && !erase && (
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
