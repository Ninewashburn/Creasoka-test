"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Combinaison ALT + A pour accéder à la page admin
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        // Ajouter un paramètre spécial pour contourner le middleware
        router.push("/admin?access_key=keyboard_shortcut");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
