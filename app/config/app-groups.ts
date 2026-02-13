/**
 * Defines which routes belong to which app group.
 * Only one route per app group can be minimized at a time.
 */

export type AppGroup = "firmenvorstellung" | "home";

export type AppGroupConfig = {
  icon: string;
};

export const ROUTE_TO_APP_GROUP: Record<string, AppGroup> = {
  "/firmenvorstellung/pages/kapitalmarkt": "firmenvorstellung",
  "/firmenvorstellung/pages/lebensplan": "firmenvorstellung",
  "/firmenvorstellung/pages/abs": "firmenvorstellung",
  "/firmenvorstellung/pages/werbung": "firmenvorstellung",
  "/firmenvorstellung/pages/empfehlung": "firmenvorstellung",
  "/firmenvorstellung/pages/chancenblatt": "firmenvorstellung",
  "/firmenvorstellung/pages/kontaktbogen": "firmenvorstellung",
  "/firmenvorstellung/home": "home",
};

export const APP_GROUP_CONFIG: Record<AppGroup, AppGroupConfig> = {
  firmenvorstellung: {
    icon: "/ovb.png",
  },
  home: {
    icon: "/home-icon.png",
  },
};

export function getAppGroup(route: string): AppGroup | null {
  return ROUTE_TO_APP_GROUP[route] ?? null;
}

export function getAppGroupIcon(appGroup: AppGroup): string {
  return APP_GROUP_CONFIG[appGroup]?.icon ?? "/ovb.png";
}
