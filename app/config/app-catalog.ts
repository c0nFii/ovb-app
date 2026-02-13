export type AppArea = "ovb-suite" | "future-apps";

export type AppEntry = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  area: AppArea;
  visibleInOverview: boolean;
};

export const APP_CATALOG: AppEntry[] = [
  {
    id: "desktop-launcher",
    title: "Desktop Launcher",
    subtitle: "Startseite",
    route: "/",
    icon: "/home-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "ovb-home",
    title: "OVB Ubersicht",
    subtitle: "Aktuelle App-Auswahl",
    route: "/firmenvorstellung/pages/home",
    icon: "/ovb.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "kapitalmarkt",
    title: "Der Kapitalmarkt",
    subtitle: "OVB Firmenvorstellung",
    route: "/firmenvorstellung/pages/kapitalmarkt",
    icon: "/kapitalmarkt-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "lebensplan",
    title: "Finanzieller Lebensplan",
    subtitle: "OVB Firmenvorstellung",
    route: "/firmenvorstellung/pages/lebensplan",
    icon: "/lebensplan-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "abs",
    title: "ABS-System",
    subtitle: "OVB Firmenvorstellung",
    route: "/firmenvorstellung/pages/abs",
    icon: "/abs-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "werbung",
    title: "Mehrwert zeigen",
    subtitle: "OVB Firmenvorstellung",
    route: "/firmenvorstellung/pages/werbung",
    icon: "/werbung-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "empfehlung",
    title: "Netzwerk",
    subtitle: "OVB Firmenvorstellung",
    route: "/firmenvorstellung/pages/empfehlung",
    icon: "/netzwerk-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "chancenblatt",
    title: "Chancenblatt",
    subtitle: "OVB Firmenvorstellung",
    route: "/firmenvorstellung/pages/chancenblatt",
    icon: "/chancenblatt-icon.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
  {
    id: "kontaktbogen",
    title: "Kontaktbogen",
    subtitle: "Folgeschritt",
    route: "/firmenvorstellung/pages/kontaktbogen",
    icon: "/icons/notizen.png",
    area: "ovb-suite",
    visibleInOverview: true,
  },
];

export const APP_AREA_LABELS: Record<AppArea, string> = {
  "ovb-suite": "OVB Firmenvorstellung",
  "future-apps": "Weitere Apps",
};

export function getOverviewApps(area: AppArea): AppEntry[] {
  return APP_CATALOG.filter(
    (entry) => entry.area === area && entry.visibleInOverview
  );
}
