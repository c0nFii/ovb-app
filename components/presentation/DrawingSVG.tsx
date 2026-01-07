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

    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  };

  const isPointNearPath = (point: Point, path: Path, radius = 12) => {
    const nums = path.d.match(/-?\d*\.?\d+/g);
    if (!nums) return false;

    for (let i = 0; i < nums.length; i += 2) {
      const x = Number(nums[i]);
      const y = Number(nums[i + 1]);
      if (distance(point, { x, y }) < radius) return true;
    }
    return false;
  };

  const start = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!active || e.pointerType !== "pen") return;

    e.preventDefault();

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
    if (!active || e.pointerType !== "pen") return;
    if (!lastPoint.current) return;

    e.preventDefault();

    const p = getPoint(e);
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
    if (!active || e.pointerType !== "pen") return;

    e.preventDefault();

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

        // 🔑 NUR aktiv im Draw / Erase Modus
        pointerEvents: active ? "auto" : "none",
        touchAction: active ? "none" : "auto",
        zIndex: active ? 9999 : -1,
      }}
      onPointerDown={active ? start : undefined}
      onPointerMove={active ? move : undefined}
      onPointerUp={active ? end : undefined}
      onPointerCancel={active ? end : undefined}
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
