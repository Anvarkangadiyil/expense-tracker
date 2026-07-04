"use client";

import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "true") {
        // Small delay to ensure the page has completely rendered and fonts are loaded
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return null;
}
