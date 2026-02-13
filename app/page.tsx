"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { APP_CATALOG } from "@/app/config/app-catalog";
import { getAppGroup, getAppGroupIcon } from "@/app/config/app-groups";
import {
  clearMinimizedApps,
  getMinimizedApps,
  removeMinimizedApp,
  type MinimizedApp,
} from "@/components/layout/minimized-apps";

export default function DesktopPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLaunching, setIsLaunching] = useState(false);
  const [minimizedApps, setMinimizedApps] = useState<MinimizedApp[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMinimizedApps(getMinimizedApps());

    // Listen for session storage changes (when apps are minimized/removed)
    const handleStorageChange = () => {
      setMinimizedApps(getMinimizedApps());
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event für changes im gleichen Tab
    window.addEventListener("minimized-apps-changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("minimized-apps-changed", handleStorageChange);
    };
  }, []);

  const minimizedWithTitles = useMemo(() => {
    return minimizedApps.map((entry) => {
      const known = APP_CATALOG.find((app) => app.route === entry.route);
      const appGroup = getAppGroup(entry.route);
      
      // Use app group icon if available, otherwise fall back to catalog icon
      let icon = "/ovb.png";
      if (appGroup) {
        icon = getAppGroupIcon(appGroup);
      } else if (known?.icon) {
        icon = known.icon;
      }
      
      return {
        ...entry,
        title: known?.title ?? entry.title,
        icon,
      };
    });
  }, [minimizedApps]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleAppClick = () => {
    setIsLaunching(true);
    setTimeout(() => {
      router.push("/firmenvorstellung/pages/home");
    }, 600);
  };

  const handleEasyClick = () => {
    setIsLaunching(true);
    setTimeout(() => setIsLaunching(false), 600);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans select-none">
      <Image
        src="/pictures/strand.png"
        alt="Desktop Background"
        fill
        className={`object-cover transition-transform duration-700 ease-in-out ${
          isLaunching ? "scale-110 blur-sm opacity-50" : "scale-100"
        }`}
        priority
      />

      <div className="absolute top-12 left-12 text-white drop-shadow-lg">
        <h1 className="text-8xl font-light tracking-tight">
          {formatTime(currentTime)}
        </h1>
        <p className="text-2xl font-medium mt-2 opacity-90">
          {formatDate(currentTime)}
        </p>
      </div>

      <div className="absolute top-12 right-12 flex flex-col items-center gap-8">
        <button
          onClick={handleAppClick}
          className="group flex flex-col items-center gap-2 focus:outline-none"
        >
          <div
            className={`relative w-24 h-24 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center p-4 transition-all duration-500 hover:scale-105 active:scale-95 ${
              isLaunching ? "scale-[3] opacity-0" : "scale-100"
            }`}
          >
            <Image
              src="/ovb.png"
              alt="Firmenvorstellung"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <span className="text-white text-sm font-medium drop-shadow-md group-hover:bg-black/20 px-2 py-0.5 rounded transition-colors">
            Firmenvorstellung
          </span>
        </button>

        <a
          href="https://easy.ovb.at/"
          target="_blank"
          rel="noreferrer"
          onClick={handleEasyClick}
          className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer"
        >
          <div className={`relative w-24 h-24 bg-[#003A66] rounded-2xl shadow-xl flex items-center justify-center p-4 transition-all duration-500 hover:scale-105 active:scale-95 ${
                isLaunching ? "scale-[3] opacity-0" : "scale-100"
              }`}>
              <Image
                src="/ovb2.png"
                alt="OVB Easy"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          <span className="text-white text-sm font-medium drop-shadow-md group-hover:bg-black/20 px-2 py-0.5 rounded transition-colors">
            OVB Easy
          </span>
        </a>
      </div>

      {isLaunching && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md animate-in fade-in duration-500" />
      )}

      {minimizedWithTitles.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 min-h-16 bg-black/20 backdrop-blur-md border-t border-white/20 flex items-center justify-center gap-4 px-4 py-2">
          <div className="flex items-center gap-3">
            {minimizedWithTitles.map((entry) => (
              <div key={entry.route} className="relative w-10 h-10">
                <button
                  onClick={() => router.push(entry.route)}
                  className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  title={entry.title}
                  aria-label={entry.title}
                >
                  <Image src={entry.icon} alt={entry.title} width={18} height={18} />
                </button>

                <button
                  onClick={() => {
                    removeMinimizedApp(entry.route);
                    setMinimizedApps(getMinimizedApps());
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[#12324e] text-xs font-bold leading-none flex items-center justify-center hover:bg-slate-200"
                  title={`${entry.title} schließen`}
                  aria-label={`${entry.title} schließen`}
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              clearMinimizedApps();
              setMinimizedApps([]);
            }}
            className="h-10 w-10 rounded-xl  hover:bg-white/25 flex items-center justify-center transition-colors absolute right-4"
            title="Taskleiste leeren"
            aria-label="Taskleiste leeren"
          >
            <Image src="/trash-icon.png" alt="Löschen" width={52} height={52} className="opacity-90" />
          </button>
        </div>
      )}
    </div>
  );
}
