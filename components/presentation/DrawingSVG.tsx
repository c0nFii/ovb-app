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
  // NEU: Pressure-Points für variable Strichdicke
  pressurePoints?: Array<{ x: number; y: number; pressure: number }>;
};

type Point = { x: number; y: number; pressure?: number };

/* =========================
   HELPERS
   ========================= */

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// NEU: Mittelpunkt zwischen zwei Punkten berechnen (für Glättung)
function midPoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    pressure: ((a.pressure || 0.5) + (b.pressure || 0.5)) / 2
  };
}

// NEU: Berechne Strichdicke basierend auf Druck
function getPressureWidth(basePressure: number, baseWidth: number): number {
  // Normalisiere Druck (manche Stifte geben 0.5 als "normal" zurück)
  const normalizedPressure = Math.max(0.1, basePressure);
  
  // Multipliziere Basisbreite mit Druck (min: 30%, max: 150%)
  const minFactor = 0.3;
  const maxFactor = 1.5;
  const factor = minFactor + (normalizedPressure * (maxFactor - minFactor));
  
  return Math.round(baseWidth * factor * 10) / 10;
}

/* =========================
   COMPONENT
   ========================= */

export default function DrawingSVG({
  active,
  erase,
  paths,
  setPaths,
  allowScroll = false,
}: {
  active: boolean;
  erase: boolean;
  paths: Path[];
  setPaths: React.Dispatch<React.SetStateAction<Path[]>>;
  allowScroll?: boolean; // Für Kontaktbogen: Erlaubt vertikales Scrollen
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPoint = useRef<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  
  // NEU: Aktuelle Pressure-Points speichern
  const currentPressurePoints = useRef<Array<{ x: number; y: number; pressure: number }>>([]);

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
     NATIVE EVENT LISTENERS - KRITISCH FÜR iOS SCRIBBLE
     ========================= */

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    // Diese Funktion blockiert ALLE nativen Browser-Aktionen für Touch/Pointer
    // WICHTIG: { passive: false } zwingt iOS, auf unseren Code zu warten
    const preventNativeActions = (e: Event) => {
      if (!active) return;

      // Für Touch Events: nur bei Single-Touch (Stift) blockieren
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Für alle anderen Events (Pointer, etc.) blockieren wenn kein Touch
      if (!touchEvent.touches) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Native Listener mit { passive: false } - das ist der Schlüssel!
    // Auf beiden Elementen registrieren für maximale Sicherheit
    const elements = [svg, container];

    elements.forEach(element => {
      element.addEventListener('touchstart', preventNativeActions, { passive: false });
      element.addEventListener('touchmove', preventNativeActions, { passive: false });
      element.addEventListener('touchend', preventNativeActions, { passive: false });
      element.addEventListener('wheel', preventNativeActions, { passive: false });
    });

    return () => {
      elements.forEach(element => {
        element.removeEventListener('touchstart', preventNativeActions);
        element.removeEventListener('touchmove', preventNativeActions);
        element.removeEventListener('touchend', preventNativeActions);
        element.removeEventListener('wheel', preventNativeActions);
      });
    };
  }, [active]);

  /* =========================
     KOORDINATEN
     ========================= */

  const getPoint = useCallback((e: React.PointerEvent | PointerEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0, pressure: 0.5 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0, pressure: 0.5 };

    const svgPoint = pt.matrixTransform(screenCTM.inverse());

    return {
      x: Math.round(svgPoint.x * 100) / 100,
      y: Math.round(svgPoint.y * 100) / 100,
      pressure: e.pressure || 0.5 // NEU: Druck auslesen (Fallback 0.5)
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
     CLICK WEITERLEITUNG
     ========================= */

  const forwardClick = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;

    // SVG kurz deaktivieren
    svg.style.pointerEvents = "none";
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    svg.style.pointerEvents = "auto";

    if (elementBelow && elementBelow !== svg) {
      // Input-Felder fokussieren
      if (elementBelow instanceof HTMLInputElement ||
          elementBelow instanceof HTMLTextAreaElement ||
          elementBelow instanceof HTMLSelectElement) {
        elementBelow.focus();
        return;
      }

      // Click simulieren
      elementBelow.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: e.clientX,
        clientY: e.clientY,
      }));
    }
  }, []);

  /* =========================
     POINTER EVENTS - NUR PEN auf SVG
     ========================= */

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // WICHTIG: preventDefault() SOFORT aufrufen um Verzögerungen zu vermeiden
    if (e.pointerType === "pen") {
      e.preventDefault();
      e.stopPropagation();
    }

    // Nicht-Stift: Weiterleiten
    if (e.pointerType !== "pen") {
      forwardClick(e);
      return;
    }

    if (!active) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    const p = getPoint(e);
    lastPoint.current = p;

    // NEU: Pressure-Points initialisieren
    currentPressurePoints.current = [{ x: p.x, y: p.y, pressure: p.pressure || 0.5 }];

    if (!erase) {
      setCurrentPath({
        d: `M ${p.x} ${p.y}`,
        color,
        width,
        pressurePoints: currentPressurePoints.current
      });
    } else {
      setPaths((prev) => prev.filter((path) => !isPointNearPath(p, path)));
    }
  }, [active, erase, color, width, getPoint, isPointNearPath, setPaths, forwardClick]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Nur Stift-Events verarbeiten
    if (e.pointerType !== "pen") return;
    if (!active || !lastPoint.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rawPoint = getPoint(e);

    // Mindestabstand erhöht für weniger Wackeln
    if (distance(rawPoint, lastPoint.current) < 2.5) return;

    // Stärkere Glättung: 55% neuer Punkt + 45% letzter Punkt
    const smoothedPoint: Point = {
      x: rawPoint.x * 0.55 + lastPoint.current.x * 0.45,
      y: rawPoint.y * 0.55 + lastPoint.current.y * 0.45,
      pressure: rawPoint.pressure || 0.5
    };

    lastPoint.current = smoothedPoint;

    // NEU: Pressure-Point hinzufügen
    if (smoothedPoint.pressure !== undefined) {
      currentPressurePoints.current.push({
        x: smoothedPoint.x,
        y: smoothedPoint.y,
        pressure: smoothedPoint.pressure
      });
    }

    if (!erase) {
      setCurrentPath((prev) =>
        prev ? {
          ...prev,
          d: `${prev.d} L ${smoothedPoint.x} ${smoothedPoint.y}`,
          pressurePoints: currentPressurePoints.current
        } : prev
      );
    } else {
      setPaths((prev) => prev.filter((path) => !isPointNearPath(smoothedPoint, path)));
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
    currentPressurePoints.current = [];
  }, [active, erase, currentPath, setPaths]);

  /* =========================
     RENDER mit PRESSURE
     ========================= */

  // NEU: Rendere Pfad mit variabler Strichdicke basierend auf Druck
  const renderPressurePath = (path: Path, key: number | string) => {
    // Wenn keine Pressure-Daten vorhanden, normale Linie rendern
    if (!path.pressurePoints || path.pressurePoints.length < 2) {
      return (
        <path
          key={key}
          d={path.d}
          fill="none"
          stroke={path.color}
          strokeWidth={path.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      );
    }

    // Mit Pressure: Rendere mehrere Segmente mit unterschiedlicher Dicke
    const points = path.pressurePoints;
    return (
      <g key={key}>
        {points.map((point, i) => {
          if (i === 0) return null;
          const prevPoint = points[i - 1];
          const avgPressure = (point.pressure + prevPoint.pressure) / 2;
          const segmentWidth = getPressureWidth(avgPressure, path.width);
          
          return (
            <line
              key={i}
              x1={prevPoint.x}
              y1={prevPoint.y}
              x2={point.x}
              y2={point.y}
              stroke={path.color}
              strokeWidth={segmentWidth}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      data-apple-pencil-scribble-enabled="false"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="none"
          // Deaktiviert Apple Pencil "Scribble" (Kritzeln) nur für dieses Element
          data-apple-pencil-scribble-enabled="false"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: active ? "auto" : "none",
            touchAction: active
              ? (allowScroll ? "pan-y" : "none")  // pan-y erlaubt vertikales Scrollen
              : "auto",
            willChange: "transform",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          // Verhindert Safari "Teilen" Popup und Kontextmenü
          onContextMenu={(e) => e.preventDefault()}
          // Touch Events werden jetzt via native Listener behandelt (siehe useEffect oben)
        >
        {/* NEU: Paths mit Pressure rendern */}
        {paths.map((p, i) => renderPressurePath(p, i))}

        {/* NEU: Current Path mit Pressure */}
        {currentPath && !erase && renderPressurePath(currentPath, 'current')}
      </svg>
    </div>
  );
}