"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { APP_CATALOG } from "@/app/config/app-catalog";
import { getAppGroup, getAppGroupIcon } from "@/app/config/app-groups";
import { FolderIcon } from "@/components/FolderIcon";
import {
  clearMinimizedApps,
  getMinimizedApps,
  removeMinimizedApp,
  type MinimizedApp,
} from "@/components/layout/minimized-apps";

interface IconPosition {
  id: string;
  x: number;
  y: number;
}

interface Folder {
  id: string;
  name: string;
  appIds: string[];
  x: number;
  y: number;
}

const GRID_SIZE = 50; // Grid cell size in pixels (finer grid for more precise placement)
const ICON_SIZE = 140; // Icon container size (w-24 h-24 + padding) in pixels
const STORAGE_KEY = "desktop-icon-positions";
const FOLDERS_KEY = "desktop-folders";
const DRAG_THRESHOLD = 20; // Minimum pixels to move before considering it a drag
const COLLISION_DISTANCE = 100; // Distance in pixels to trigger folder creation

export default function DesktopPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLaunching, setIsLaunching] = useState(false);
  const [minimizedApps, setMinimizedApps] = useState<MinimizedApp[]>([]);
  const [iconPositions, setIconPositions] = useState<IconPosition[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [wasJustDragging, setWasJustDragging] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [openingFolderId, setOpeningFolderId] = useState<string | null>(null);
  const [draggingFromFolder, setDraggingFromFolder] = useState<string | null>(null);

  // Taskbar drag-to-trash state
  const [draggingTaskbarApp, setDraggingTaskbarApp] = useState<string | null>(null);
  const [taskbarDragPos, setTaskbarDragPos] = useState({ x: 0, y: 0 });
  const [taskbarDragStartPos, setTaskbarDragStartPos] = useState({ x: 0, y: 0 });
  const [isTaskbarDragging, setIsTaskbarDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const trashRef = useRef<HTMLButtonElement>(null);
  const draggingTaskbarIcon = useRef<string>("");  // icon src for ghost

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize icon positions from localStorage or defaults
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const positions = JSON.parse(stored);
        setIconPositions(positions);
      } catch {
        setIconPositions([
          { id: "firmenvorstellung", x: window.innerWidth - 200, y: 48 },
          { id: "easy", x: window.innerWidth - 200, y: 200 },
        ]);
      }
    } else {
      // Default positions - right side, stacked vertically
      setIconPositions([
        { id: "firmenvorstellung", x: window.innerWidth - 200, y: 48 },
        { id: "easy", x: window.innerWidth - 200, y: 200 },
      ]);
    }

    // Load folders
    const storedFolders = localStorage.getItem(FOLDERS_KEY);
    if (storedFolders) {
      try {
        setFolders(JSON.parse(storedFolders));
      } catch {
        setFolders([]);
      }
    }
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

  // --- Taskbar drag-to-trash handlers ---
  const TASKBAR_DRAG_THRESHOLD = 10;

  const checkOverTrash = (clientX: number, clientY: number) => {
    if (!trashRef.current) return false;
    const rect = trashRef.current.getBoundingClientRect();
    const padding = 20;
    return (
      clientX >= rect.left - padding &&
      clientX <= rect.right + padding &&
      clientY >= rect.top - padding &&
      clientY <= rect.bottom + padding
    );
  };

  const handleTaskbarPointerDown = (e: React.MouseEvent | React.TouchEvent, route: string, iconSrc: string) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    e.preventDefault();

    setDraggingTaskbarApp(route);
    setTaskbarDragStartPos({ x: clientX, y: clientY });
    setTaskbarDragPos({ x: clientX, y: clientY });
    setIsTaskbarDragging(false);
    draggingTaskbarIcon.current = iconSrc;
  };

  useEffect(() => {
    if (draggingTaskbarApp === null) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - taskbarDragStartPos.x;
      const dy = clientY - taskbarDragStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > TASKBAR_DRAG_THRESHOLD) {
        setIsTaskbarDragging(true);
      }

      setTaskbarDragPos({ x: clientX, y: clientY });
      setIsOverTrash(checkOverTrash(clientX, clientY));
    };

    const onEnd = () => {
      if (isTaskbarDragging && isOverTrash && draggingTaskbarApp) {
        removeMinimizedApp(draggingTaskbarApp);
        setMinimizedApps(getMinimizedApps());
      } else if (!isTaskbarDragging && draggingTaskbarApp) {
        // Was just a click, not a drag — navigate to the app
        router.push(draggingTaskbarApp);
      }

      setDraggingTaskbarApp(null);
      setIsTaskbarDragging(false);
      setIsOverTrash(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingTaskbarApp, isTaskbarDragging, isOverTrash, taskbarDragStartPos]);

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

  // Snap position to grid
  const snapToGrid = (pos: number): number => {
    return Math.round(pos / GRID_SIZE) * GRID_SIZE;
  };

  // Constrain position within screen bounds
  const constrainToBounds = (x: number, y: number) => {
    const maxX = typeof window !== "undefined" ? window.innerWidth - ICON_SIZE : x;
    const maxY = typeof window !== "undefined" ? window.innerHeight - ICON_SIZE : y;
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    };
  };

  // Save positions to localStorage
  const savePositions = (positions: IconPosition[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  };

  const saveFolders = (folderList: Folder[]) => {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folderList));
  };

  // Check if two icons collide
  const checkCollision = (pos1: IconPosition, pos2: IconPosition): boolean => {
    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
    return distance < COLLISION_DISTANCE;
  };

  // Find which folder an app belongs to
  const getAppFolder = (appId: string): Folder | undefined => {
    return folders.find((f) => f.appIds.includes(appId));
  };

  // Get apps that are not in any folder
  const getLooseApps = (): IconPosition[] => {
    return iconPositions.filter((pos) => !getAppFolder(pos.id));
  };

  // Get apps in a folder for FolderIcon display
  const getFolderApps = (folder: Folder) => {
    // Mapping von Icon-IDs zu APP_CATALOG IDs
    const idMappings: Record<string, string> = {
      "firmenvorstellung": "ovb-home",
      "easy": "easy",
    };

    return folder.appIds
      .map((appId) => {
        // Special case for 'easy' which is not in APP_CATALOG
        if (appId === "easy") {
          return {
            id: appId,
            name: "OVB Easy",
            icon: "/ovb2.png",
            color: undefined,
          };
        }

        // Map icon ID to catalog ID
        const catalogId = idMappings[appId] || appId;
        const appFromCatalog = APP_CATALOG.find((app) => app.id === catalogId);
        const appGroup = getAppGroup(appId);
        
        let icon = undefined;
        if (appGroup) {
          icon = getAppGroupIcon(appGroup);
        } else if (appFromCatalog?.icon) {
          icon = appFromCatalog.icon;
        }

        return {
          id: appId,
          name: appFromCatalog?.title ?? appId,
          icon: icon,
          color: undefined,
        };
      })
      .slice(0, 9); // Only show first 9 apps
  };

  // Helper function to get coordinates from mouse or touch event
  const getEventCoordinates = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ): { x: number; y: number } => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    iconId: string,
    fromFolderId?: string
  ) => {
    // Don't drag if clicking with middle mouse or right click
    if (e.button !== 0) return;

    e.preventDefault();
    const coords = getEventCoordinates(e);
    setDraggingId(iconId);
    setDragStartPos(coords);
    setIsDragging(false); // Reset (will be set to true if moved > threshold)
    
    // Track if dragging from folder
    if (fromFolderId) {
      setDraggingFromFolder(fromFolderId);
    }

    // Check if it's a folder
    const folder = folders.find((f) => f.id === iconId);
    if (folder) {
      setDragOffset({
        x: coords.x - folder.x,
        y: coords.y - folder.y,
      });
      return;
    }

    // Check if it's a loose app
    const iconPos = iconPositions.find((p) => p.id === iconId);
    if (iconPos) {
      setDragOffset({
        x: coords.x - iconPos.x,
        y: coords.y - iconPos.y,
      });
    } else if (fromFolderId) {
      // Dragging from folder - start from cursor position
      setDragOffset({
        x: 70,
        y: 70,
      });
    }
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    iconId: string,
    fromFolderId?: string
  ) => {
    e.preventDefault();
    const coords = getEventCoordinates(e);
    setDraggingId(iconId);
    setDragStartPos(coords);
    setIsDragging(false); // Reset (will be set to true if moved > threshold)
    
    // Track if dragging from folder
    if (fromFolderId) {
      setDraggingFromFolder(fromFolderId);
    }

    // Check if it's a folder
    const folder = folders.find((f) => f.id === iconId);
    if (folder) {
      setDragOffset({
        x: coords.x - folder.x,
        y: coords.y - folder.y,
      });
      return;
    }

    // Check if it's a loose app
    const iconPos = iconPositions.find((p) => p.id === iconId);
    if (iconPos) {
      setDragOffset({
        x: coords.x - iconPos.x,
        y: coords.y - iconPos.y,
      });
    } else if (fromFolderId) {
      // Dragging from folder - start from cursor position
      setDragOffset({
        x: 70,
        y: 70,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId) return;

    // Check if drag threshold has been exceeded
    if (!isDragging) {
      const coords = { x: e.clientX, y: e.clientY };
      const distance = Math.sqrt(
        Math.pow(coords.x - dragStartPos.x, 2) +
          Math.pow(coords.y - dragStartPos.y, 2)
      );
      if (distance < DRAG_THRESHOLD) return;
      setIsDragging(true);
    }

    const coords = { x: e.clientX, y: e.clientY };
    const newX = coords.x - dragOffset.x;
    const newY = coords.y - dragOffset.y;

    // Don't snap to grid while dragging - only constrain to bounds
    const constrainedPos = constrainToBounds(newX, newY);

    // Update position if it's a folder or an icon
    const isFolder = draggingId.startsWith("folder-");
    
    if (isFolder) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === draggingId ? { ...folder, ...constrainedPos } : folder
        )
      );
    } else {
      // Check if it exists in iconPositions, if not create temporary position
      setIconPositions((prev) => {
        const existing = prev.find((p) => p.id === draggingId);
        if (existing) {
          return prev.map((pos) =>
            pos.id === draggingId ? { ...pos, ...constrainedPos } : pos
          );
        } else {
          // New temporary position for dragging from folder
          return [...prev, { id: draggingId, ...constrainedPos }];
        }
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingId) return;

    // Check if drag threshold has been exceeded
    if (!isDragging) {
      const coords = getEventCoordinates(e);
      const distance = Math.sqrt(
        Math.pow(coords.x - dragStartPos.x, 2) +
          Math.pow(coords.y - dragStartPos.y, 2)
      );
      if (distance < DRAG_THRESHOLD) return;
      setIsDragging(true);
    }

    e.preventDefault();
    const coords = getEventCoordinates(e);
    const newX = coords.x - dragOffset.x;
    const newY = coords.y - dragOffset.y;

    // Don't snap to grid while dragging - only constrain to bounds
    const constrainedPos = constrainToBounds(newX, newY);

    // Update position if it's a folder or an icon
    const isFolder = draggingId.startsWith("folder-");
    
    if (isFolder) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === draggingId ? { ...folder, ...constrainedPos } : folder
        )
      );
    } else {
      // Check if it exists in iconPositions, if not create temporary position
      setIconPositions((prev) => {
        const existing = prev.find((p) => p.id === draggingId);
        if (existing) {
          return prev.map((pos) =>
            pos.id === draggingId ? { ...pos, ...constrainedPos } : pos
          );
        } else {
          // New temporary position for dragging from folder
          return [...prev, { id: draggingId, ...constrainedPos }];
        }
      });
    }
  };

  const handlePointerUp = () => {
    if (draggingId) {
      const isFolder = draggingId.startsWith("folder-");
      
      // Snap to grid on release
      if (isDragging) {
        if (isFolder) {
          const folder = folders.find((f) => f.id === draggingId);
          if (folder) {
            const snappedPos = constrainToBounds(
              snapToGrid(folder.x),
              snapToGrid(folder.y)
            );
            setFolders((prev) =>
              prev.map((f) =>
                f.id === draggingId ? { ...f, ...snappedPos } : f
              )
            );
          }
        } else {
          const icon = iconPositions.find((p) => p.id === draggingId);
          if (icon) {
            const snappedPos = constrainToBounds(
              snapToGrid(icon.x),
              snapToGrid(icon.y)
            );
            setIconPositions((prev) =>
              prev.map((p) =>
                p.id === draggingId ? { ...p, ...snappedPos } : p
              )
            );
          }
        }
      }
      
      if (isFolder) {
        // Save folder position
        saveFolders(folders);
      } else {
        // Check if we were dragging from a folder
        if (draggingFromFolder && isDragging) {
          // App was dragged out of folder
          const folder = folders.find((f) => f.id === draggingFromFolder);
          if (folder) {
            // Remove app from folder
            const updatedAppIds = folder.appIds.filter((id) => id !== draggingId);
            
            if (updatedAppIds.length < 2) {
              // Remove folder if < 2 apps left, restore remaining app
              if (updatedAppIds.length === 1) {
                const remainingAppId = updatedAppIds[0];
                // Only filter out the remaining app (the dragged one already has its position)
                setIconPositions((prev) => [
                  ...prev.filter((p) => p.id !== remainingAppId),
                  { id: remainingAppId, x: folder.x, y: folder.y },
                ]);
              }
              
              const updatedFolders = folders.filter((f) => f.id !== draggingFromFolder);
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            } else {
              // Just update folder with remaining apps
              const updatedFolders = folders.map((f) =>
                f.id === draggingFromFolder ? { ...f, appIds: updatedAppIds } : f
              );
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            }
            
            // Close folder modal
            setOpeningFolderId(null);
          }
          
          setDraggingFromFolder(null);
          savePositions(iconPositions);
        } else if (draggingFromFolder && !isDragging) {
          // Started dragging from folder but didn't move enough - clean up temporary position
          setIconPositions((prev) => prev.filter((p) => p.id !== draggingId));
          setDraggingFromFolder(null);
        } else {
          // Normal desktop icon drag
          savePositions(iconPositions);
          
          // Check if this app was in a folder - if so, remove it
          const appFolder = getAppFolder(draggingId);
          if (appFolder) {
            const updatedAppIds = appFolder.appIds.filter((id) => id !== draggingId);
            
            if (updatedAppIds.length < 2) {
              // Remove folder if < 2 apps left, restore apps as loose
              const remainingApps = iconPositions.filter((p) => updatedAppIds.includes(p.id));
              
              const restoredApps = remainingApps.concat(
                updatedAppIds.map((appId) => {
                  const origIcon = iconPositions.find((p) => p.id === appId);
                  if (origIcon) return origIcon;
                  // Fallback position
                  return { id: appId, x: appFolder.x, y: appFolder.y };
                })
              );
              
              setIconPositions(restoredApps);
              savePositions(restoredApps);
              
              const updatedFolders = folders.filter((f) => f.id !== appFolder.id);
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            } else {
              // Just update folder with remaining apps
              const updatedFolders = folders.map((f) =>
                f.id === appFolder.id ? { ...f, appIds: updatedAppIds } : f
              );
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            }
          }
          
          // Check for collisions with other icons to create folders
          const draggedIcon = iconPositions.find((p) => p.id === draggingId);
          if (draggedIcon && !getAppFolder(draggingId)) {  // Only if not already in a folder
            const collidingIcon = getLooseApps().find(
              (p) => p.id !== draggingId && checkCollision(draggedIcon, p)
            );
            
            if (collidingIcon && !getAppFolder(collidingIcon.id)) {
              // Create folder
              const folderId = `folder-${Date.now()}`;
              const newFolder: Folder = {
                id: folderId,
                name: `Ordner ${folders.length + 1}`,
                appIds: [draggingId, collidingIcon.id],
                x: draggedIcon.x,
                y: draggedIcon.y,
              };
              const updatedFolders = [...folders, newFolder];
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
              
              // Remove these icons from loose positions
              setIconPositions((prev) =>
                prev.filter((p) => p.id !== draggingId && p.id !== collidingIcon.id)
              );
              
              // Set up for renaming
              setRenamingFolderId(folderId);
              setFolderNameInput(newFolder.name);
            }
          }
        }
      }
      
      setDraggingId(null);
      setDraggingFromFolder(null);
      
      // Only set wasJustDragging if we actually dragged
      if (isDragging) {
        setWasJustDragging(true);
        setTimeout(() => setWasJustDragging(false), 200);
      }
      
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    if (draggingId) {
      const isFolder = draggingId.startsWith("folder-");
      
      // Snap to grid on release
      if (isDragging) {
        if (isFolder) {
          const folder = folders.find((f) => f.id === draggingId);
          if (folder) {
            const snappedPos = constrainToBounds(
              snapToGrid(folder.x),
              snapToGrid(folder.y)
            );
            setFolders((prev) =>
              prev.map((f) =>
                f.id === draggingId ? { ...f, ...snappedPos } : f
              )
            );
          }
        } else {
          const icon = iconPositions.find((p) => p.id === draggingId);
          if (icon) {
            const snappedPos = constrainToBounds(
              snapToGrid(icon.x),
              snapToGrid(icon.y)
            );
            setIconPositions((prev) =>
              prev.map((p) =>
                p.id === draggingId ? { ...p, ...snappedPos } : p
              )
            );
          }
        }
      }
      
      if (isFolder) {
        // Save folder position
        saveFolders(folders);
      } else {
        // Check if we were dragging from a folder
        if (draggingFromFolder && isDragging) {
          // App was dragged out of folder
          const folder = folders.find((f) => f.id === draggingFromFolder);
          if (folder) {
            // Remove app from folder
            const updatedAppIds = folder.appIds.filter((id) => id !== draggingId);
            
            if (updatedAppIds.length < 2) {
              // Remove folder if < 2 apps left, restore remaining app
              if (updatedAppIds.length === 1) {
                const remainingAppId = updatedAppIds[0];
                // Only filter out the remaining app (the dragged one already has its position)
                setIconPositions((prev) => [
                  ...prev.filter((p) => p.id !== remainingAppId),
                  { id: remainingAppId, x: folder.x, y: folder.y },
                ]);
              }
              
              const updatedFolders = folders.filter((f) => f.id !== draggingFromFolder);
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            } else {
              // Just update folder with remaining apps
              const updatedFolders = folders.map((f) =>
                f.id === draggingFromFolder ? { ...f, appIds: updatedAppIds } : f
              );
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            }
            
            // Close folder modal
            setOpeningFolderId(null);
          }
          
          setDraggingFromFolder(null);
          savePositions(iconPositions);
        } else if (draggingFromFolder && !isDragging) {
          // Started dragging from folder but didn't move enough - clean up temporary position
          setIconPositions((prev) => prev.filter((p) => p.id !== draggingId));
          setDraggingFromFolder(null);
        } else {
          // Normal desktop icon drag
          savePositions(iconPositions);
          
          // Check if this app was in a folder - if so, remove it
          const appFolder = getAppFolder(draggingId);
          if (appFolder) {
            const updatedAppIds = appFolder.appIds.filter((id) => id !== draggingId);
            
            if (updatedAppIds.length < 2) {
              // Remove folder if < 2 apps left, restore apps as loose
              const remainingApps = iconPositions.filter((p) => updatedAppIds.includes(p.id));
              
              const restoredApps = remainingApps.concat(
                updatedAppIds.map((appId) => {
                  const origIcon = iconPositions.find((p) => p.id === appId);
                  if (origIcon) return origIcon;
                  // Fallback position
                  return { id: appId, x: appFolder.x, y: appFolder.y };
                })
              );
              
              setIconPositions(restoredApps);
              savePositions(restoredApps);
              
              const updatedFolders = folders.filter((f) => f.id !== appFolder.id);
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            } else {
              // Just update folder with remaining apps
              const updatedFolders = folders.map((f) =>
                f.id === appFolder.id ? { ...f, appIds: updatedAppIds } : f
              );
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
            }
          }
          
          // Check for collisions with other icons to create folders
          const draggedIcon = iconPositions.find((p) => p.id === draggingId);
          if (draggedIcon && !getAppFolder(draggingId)) {  // Only if not already in a folder
            const collidingIcon = getLooseApps().find(
              (p) => p.id !== draggingId && checkCollision(draggedIcon, p)
            );
            
            if (collidingIcon && !getAppFolder(collidingIcon.id)) {
              // Create folder
              const folderId = `folder-${Date.now()}`;
              const newFolder: Folder = {
                id: folderId,
                name: `Ordner ${folders.length + 1}`,
                appIds: [draggingId, collidingIcon.id],
                x: draggedIcon.x,
                y: draggedIcon.y,
              };
              const updatedFolders = [...folders, newFolder];
              setFolders(updatedFolders);
              saveFolders(updatedFolders);
              
              // Remove these icons from loose positions
              setIconPositions((prev) =>
                prev.filter((p) => p.id !== draggingId && p.id !== collidingIcon.id)
              );
              
              // Set up for renaming
              setRenamingFolderId(folderId);
              setFolderNameInput(newFolder.name);
            }
          }
        }
      }
      
      setDraggingId(null);
      setDraggingFromFolder(null);
      
      // Only set wasJustDragging if we actually dragged
      if (isDragging) {
        setWasJustDragging(true);
        setTimeout(() => setWasJustDragging(false), 200);
      }
      
      setIsDragging(false);
    }
  };

  const handleAppClick = () => {
    // Don't trigger click if we were just dragging
    if (wasJustDragging) return;

    setIsLaunching(true);
    setTimeout(() => {
      router.push("/firmenvorstellung/pages/home");
    }, 600);
  };

  const handleEasyClick = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't trigger click if we were just dragging
    if (wasJustDragging) {
      e?.preventDefault();
      return;
    }

    // If event exists, allow default link behavior (opening in new tab)
    // Otherwise, open manually
    if (!e) {
      window.open("https://easy.ovb.at/", "_blank", "noreferrer");
    }
    
    setIsLaunching(true);
    setTimeout(() => setIsLaunching(false), 600);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black font-sans select-none"
      style={{ touchAction: "none" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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

      {/* Draggable Icons Container */}
      {getLooseApps().map((pos) => {
        if (pos.id === "firmenvorstellung") {
          return (
            <div
              key={pos.id}
              className={`absolute transition-opacity ${
                isLaunching ? "opacity-0" : "opacity-100"
              } ${draggingId === pos.id ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${ICON_SIZE}px`,
              }}
              onMouseDown={(e) => handleMouseDown(e, pos.id)}
              onTouchStart={(e) => handleTouchStart(e, pos.id)}
            >
              <button
                onClick={handleAppClick}
                className="group flex flex-col items-center gap-2 focus:outline-none w-full"
              >
                <div className="relative w-24 h-24 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center p-4 transition-all duration-500 hover:scale-105 active:scale-95">
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
            </div>
          );
        } else if (pos.id === "easy") {
          return (
            <div
              key={pos.id}
              className={`absolute transition-opacity ${
                isLaunching ? "opacity-0" : "opacity-100"
              } ${draggingId === pos.id ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${ICON_SIZE}px`,
              }}
              onMouseDown={(e) => handleMouseDown(e, pos.id)}
              onTouchStart={(e) => handleTouchStart(e, pos.id)}
            >
              <a
                href="https://easy.ovb.at/"
                target="_blank"
                rel="noreferrer"
                onClick={handleEasyClick}
                className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer w-full"
              >
                <div className="relative w-24 h-24 bg-[#003A66] rounded-2xl shadow-xl flex items-center justify-center p-4 transition-all duration-500 hover:scale-105 active:scale-95">
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
          );
        }
        return null;
      })}
      
      {/* Show all icons that have positions (includes dragged from folder) */}
      {iconPositions.filter((pos) => getAppFolder(pos.id) && draggingId !== pos.id).length === 0 ? null : 
        iconPositions.filter((pos) => {
          // Show if it's NOT in a folder OR it's currently being dragged
          return getAppFolder(pos.id) && pos.id === draggingId && isDragging;
        }).map((pos) => {
          if (pos.id === "firmenvorstellung") {
            return (
              <div
                key={pos.id}
                className={`absolute transition-opacity opacity-100 cursor-grabbing`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${ICON_SIZE}px`,
                }}
              >
                <div className="group flex flex-col items-center gap-2 focus:outline-none w-full">
                  <div className="relative w-24 h-24 bg-white/90 rounded-2xl shadow-xl flex items-center justify-center p-4">
                    <Image
                      src="/ovb.png"
                      alt="Firmenvorstellung"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white text-sm font-medium drop-shadow-md px-2 py-0.5 rounded">
                    Firmenvorstellung
                  </span>
                </div>
              </div>
            );
          } else if (pos.id === "easy") {
            return (
              <div
                key={pos.id}
                className={`absolute transition-opacity opacity-100 cursor-grabbing`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${ICON_SIZE}px`,
                }}
              >
                <div className="group flex flex-col items-center gap-2 focus:outline-none w-full">
                  <div className="relative w-24 h-24 bg-[#003A66] rounded-2xl shadow-xl flex items-center justify-center p-4">
                    <Image
                      src="/ovb2.png"
                      alt="OVB Easy"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white text-sm font-medium drop-shadow-md px-2 py-0.5 rounded">
                    OVB Easy
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })
      }

      {/* Folders */}
      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`absolute transition-opacity ${
            isLaunching ? "opacity-0" : "opacity-100"
          } ${draggingId === folder.id ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            left: `${folder.x}px`,
            top: `${folder.y}px`,
            width: `${ICON_SIZE}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e, folder.id)}
          onTouchStart={(e) => handleTouchStart(e, folder.id)}
        >
          <FolderIcon
          apps={getFolderApps(folder)}
          title={folder.name}
          onClick={() => !wasJustDragging && setOpeningFolderId(folder.id)}
        />
        </div>
      ))}

      {/* Folder Renaming Dialog */}
      {renamingFolderId && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/15 backdrop-blur-sm z-50">
          <div className="bg-[#003A66] rounded-2xl p-6 w-80 shadow-2xl border border-white/20">
            <h2 className="text-white text-lg font-semibold mb-4">Ordner umbenennen</h2>
            <input
              type="text"
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const updatedFolders = folders.map((f) =>
                    f.id === renamingFolderId ? { ...f, name: folderNameInput } : f
                  );
                  setFolders(updatedFolders);
                  saveFolders(updatedFolders);
                  setRenamingFolderId(null);
                } else if (e.key === "Escape") {
                  setRenamingFolderId(null);
                }
              }}
              className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-white/60 transition-colors"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const updatedFolders = folders.map((f) =>
                    f.id === renamingFolderId ? { ...f, name: folderNameInput } : f
                  );
                  setFolders(updatedFolders);
                  saveFolders(updatedFolders);
                  setRenamingFolderId(null);
                }}
                className="flex-1 bg-white text-[#003A66] rounded-lg py-2 font-medium hover:bg-gray-200 transition-colors"
              >
                Fertig
              </button>
              <button
                onClick={() => setRenamingFolderId(null)}
                className="flex-1 bg-white/10 text-white rounded-lg py-2 font-medium hover:bg-white/20 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Contents Modal */}
      {openingFolderId && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/15 backdrop-blur-sm z-50">
          <div className="bg-[#003A66] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-white text-2xl font-semibold">
                  {folders.find((f) => f.id === openingFolderId)?.name}
                </h2>
                <button
                  onClick={() => {
                    const folder = folders.find((f) => f.id === openingFolderId);
                    if (folder) {
                      setRenamingFolderId(folder.id);
                      setFolderNameInput(folder.name);
                      setOpeningFolderId(null);
                    }
                  }}
                  className="text-white/60 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  title="Umbenennen"
                >
                  ✏️
                </button>
              </div>
              <button
                onClick={() => setOpeningFolderId(null)}
                className="text-white/60 hover:text-white text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            {/* Icon Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {folders.find((f) => f.id === openingFolderId)?.appIds.map((appId) => {
                const isBeingDragged = draggingId === appId && isDragging;
                
                return (
                  <div
                    key={appId}
                    className="relative"
                  >
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const coords = { x: e.clientX, y: e.clientY };
                        setDraggingId(appId);
                        setDragStartPos(coords);
                        setIsDragging(false);
                        setDraggingFromFolder(openingFolderId);
                        setDragOffset({ x: 70, y: 70 });
                      }}
                      onClick={() => {
                        if (wasJustDragging || isDragging) return;
                        
                        setOpeningFolderId(null);
                        
                        if (appId === "firmenvorstellung") {
                          setTimeout(() => {
                            setWasJustDragging(false);
                            handleAppClick();
                          }, 100);
                        } else if (appId === "easy") {
                          setTimeout(() => {
                            setWasJustDragging(false);
                            handleEasyClick();
                          }, 100);
                        }
                      }}
                      className={`flex flex-col items-center gap-2 w-full transition-opacity ${
                        isBeingDragged ? "opacity-30" : "opacity-100 cursor-pointer hover:bg-white/10 rounded-xl p-2 -m-2"
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center p-3 transition-all duration-300 hover:scale-105 ${
                        appId === "firmenvorstellung" ? "bg-white/90" : appId === "easy" ? "bg-[#003A66]" : "bg-white/90"
                      }`}>
                        <Image
                          src={appId === "firmenvorstellung" ? "/ovb.png" : appId === "easy" ? "/ovb2.png" : "/ovb.png"}
                          alt={appId}
                          width={48}
                          height={48}
                          className="object-contain pointer-events-none"
                          draggable={false}
                        />
                      </div>
                      <span className="text-white text-xs font-medium text-center line-clamp-2">
                        {appId === "firmenvorstellung" ? "Firmenvorstellung" : appId === "easy" ? "OVB Easy" : appId}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
            
            <p className="text-white/50 text-xs text-center">
              Drag & Drop zum Rausziehen
            </p>
          </div>


        </div>
      )}

      {/* Global Dragged Icon - shown when dragging from folder */}
      {draggingFromFolder && draggingId && isDragging && (
        <div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: `${iconPositions.find((p) => p.id === draggingId)?.x ?? 0}px`,
            top: `${iconPositions.find((p) => p.id === draggingId)?.y ?? 0}px`,
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))',
          }}
        >
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <div className={`w-24 h-24 rounded-2xl shadow-2xl flex items-center justify-center p-4 ${
              draggingId === "firmenvorstellung" ? "bg-white/90" : draggingId === "easy" ? "bg-[#003A66]" : "bg-white/90"
            }`}>
              <Image
                src={draggingId === "firmenvorstellung" ? "/ovb.png" : draggingId === "easy" ? "/ovb2.png" : "/ovb.png"}
                alt={draggingId}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg px-2 py-0.5 rounded bg-black/30">
              {draggingId === "firmenvorstellung" ? "Firmenvorstellung" : draggingId === "easy" ? "OVB Easy" : draggingId}
            </span>
          </div>
        </div>
      )}

      {isLaunching && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md animate-in fade-in duration-500" />
      )}

      {minimizedWithTitles.length > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    {/* Das Dock-Gehäuse */}
    <div className="flex items-end gap-3 px-4 py-3 bg-white/20 dark:bg-black/30 backdrop-blur-2xl border border-white/30 rounded-[24px] shadow-2xl ring-1 ring-black/5 transition-all duration-300">

      {/* Die minimierten Apps */}
      <div className="flex items-center gap-2">
        {minimizedWithTitles.map((entry) => (
          <div key={entry.route} className="relative group">
            {/* Das App Icon — draggable zum Papierkorb */}
            <button
              onMouseDown={(e) => handleTaskbarPointerDown(e, entry.route, entry.icon)}
              onTouchStart={(e) => handleTaskbarPointerDown(e, entry.route, entry.icon)}
              className={`w-14 h-14 rounded-[22%] bg-gradient-to-b from-white/20 to-transparent flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 hover:-translate-y-2 shadow-sm border border-white/10 select-none ${
                draggingTaskbarApp === entry.route && isTaskbarDragging ? "opacity-30" : ""
              }`}
              title={entry.title}
            >
              <Image
                src={entry.icon}
                alt={entry.title}
                width={36}
                height={36}
                className="drop-shadow-md pointer-events-none"
              />
            </button>

            
          </div>
        ))}
      </div>

      {/* Trennlinie (wie beim Mac vor dem Papierkorb) */}
      <div className="w-[1px] h-10 bg-white/20 mx-1 self-center"></div>

      {/* Papierkorb / Clear Button — auch Drop-Target */}
      <button
        ref={trashRef}
        onClick={() => {
          if (!isTaskbarDragging) {
            clearMinimizedApps();
            setMinimizedApps([]);
          }
        }}
        className={`w-14 h-14 rounded-[22%] hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 hover:-translate-y-2 group ${
          isOverTrash ? "scale-125 bg-red-500/30 ring-2 ring-[#003A66] shadow-[0_0_20px_rgba(0,58,102,0.5)]" : ""
        }`}
        title="Apps hierher ziehen zum Schließen"
      >
        <Image
          src="/trash-icon.png"
          alt="Löschen"
          width={55}
          height={55}
          className={`transition-all duration-200 ${isOverTrash ? "opacity-100 scale-110" : "opacity-70 group-hover:opacity-100"}`}
        />
      </button>
    </div>
  </div>
)}

      {/* Ghost-Element für Taskbar-Drag */}
      {draggingTaskbarApp && isTaskbarDragging && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: taskbarDragPos.x - 28,
            top: taskbarDragPos.y - 28,
          }}
        >
          <div className={`w-14 h-14 rounded-[22%] bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/30 transition-transform duration-150 ${
            isOverTrash ? "scale-75 opacity-60" : "scale-110"
          }`}>
            <Image
              src={draggingTaskbarIcon.current}
              alt="Dragging"
              width={36}
              height={36}
              className="drop-shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
