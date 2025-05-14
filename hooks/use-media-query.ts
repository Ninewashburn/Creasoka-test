"use client";

import { useState, useEffect } from "react";

// Breakpoint commun pour la détection mobile
const MOBILE_BREAKPOINT = 768;

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
};

// Hook spécifique pour détecter les appareils mobiles
export const useIsMobile = (): boolean => {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
};
