# App-Katalog

Diese Struktur ist rein additiv und aendert keine bestehende Navigation/TopBar/Flows.

Dateien:
- `app/config/app-catalog.ts`: zentrale Registry fuer neue und bestehende Apps
- `components/catalog/AppOverview.tsx`: UI der Uebersichtsseite
- `app/apps/page.tsx`: Route fuer die Uebersicht (`/apps`)

Wie neue Apps eintragen:
1. Neue Route wie gehabt bauen (`app/pages/.../page.tsx` oder eigene Route).
2. In `APP_CATALOG` einen neuen Eintrag anlegen.
3. `area` auf `future-apps` setzen, wenn es nicht Teil der OVB-Firmenvorstellung ist.
4. `visibleInOverview` auf `true` setzen.

Hinweis:
- Da keine bestehenden Dateien angepasst wurden, bleibt das Laufzeitverhalten der aktuellen App unveraendert.
