import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { removeMinimizedApp } from "./minimized-apps";

/**
 * Hook that automatically removes current page from minimized apps
 * when the page loads. This ensures only one instance of an app is active.
 */
export function useRemoveFromMinimized() {
  const pathname = usePathname();

  useEffect(() => {
    // Remove current page from minimized apps when it loads
    removeMinimizedApp(pathname);
  }, [pathname]);
}
