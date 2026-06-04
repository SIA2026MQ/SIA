import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // This runs every time the URL path or query params change
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}