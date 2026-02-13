export type MinimizedApp = {
  route: string;
  title: string;
  minimizedAt: number;
};

const STORAGE_KEY = "ovb:minimized-apps";

function safeRead(): MinimizedApp[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is MinimizedApp => {
      return (
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as MinimizedApp).route === "string" &&
        typeof (entry as MinimizedApp).title === "string" &&
        typeof (entry as MinimizedApp).minimizedAt === "number"
      );
    });
  } catch {
    return [];
  }
}

function safeWrite(entries: MinimizedApp[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  // Trigger custom event for same-tab updates
  window.dispatchEvent(new Event("minimized-apps-changed"));
}

export function getMinimizedApps(): MinimizedApp[] {
  return safeRead().sort((a, b) => b.minimizedAt - a.minimizedAt);
}

export function addMinimizedApp(route: string, title: string) {
  // Import app groups dynamically to avoid circular dependencies
  const { getAppGroup } = require("@/app/config/app-groups");
  
  const currentGroup = getAppGroup(route);
  let existing = safeRead();
  
  // If the app belongs to a group, remove all other apps from that group
  if (currentGroup) {
    existing = existing.filter((entry) => {
      const entryGroup = getAppGroup(entry.route);
      // Keep if: it's the same route, or it's a different group
      return entry.route === route || entryGroup !== currentGroup;
    });
  } else {
    // If no group, just remove the same route
    existing = existing.filter((entry) => entry.route !== route);
  }
  
  // Remove the current route if it exists (to avoid duplicates)
  existing = existing.filter((entry) => entry.route !== route);
  
  const next: MinimizedApp = {
    route,
    title,
    minimizedAt: Date.now(),
  };

  safeWrite([next, ...existing]);
}

export function removeMinimizedApp(route: string) {
  const existing = safeRead().filter((entry) => entry.route !== route);
  safeWrite(existing);
}

export function clearMinimizedApps() {
  safeWrite([]);
}
