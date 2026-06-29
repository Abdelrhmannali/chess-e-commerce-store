import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll window to top on route change (React Router pages). */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}

/** Imperative helper for in-app tab navigation (no URL change). */
export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
