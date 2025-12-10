"use client";

import { useEffect } from "react";
import { setToCache } from "@/lib/clientCache";
import type { Creation } from "@/types/creation";
import { clientLogger } from "@/lib/client-logger";

export default function PreloadData() {
  useEffect(() => {
    // Fonction pour précharger les données importantes
    const preloadImportantData = () => {
      // Préchargement de la liste des créations


      fetch("/api/creations")
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error("Échec du préchargement des créations");
        })
        .then((data) => {
          // Stocker dans le cache client pour une utilisation ultérieure
          setToCache("allCreations", data);


          // Précharger les créations vedettes
          const featured = data
            .filter((creation: Creation) => creation.status === "vedette")
            .slice(0, 3);

          setToCache("featuredCreations", featured);
        })
        .catch((error) => {
          clientLogger.error("Erreur de préchargement", error);
        });
    };

    // Attendre que la page soit complètement chargée pour lancer le préchargement
    // afin de ne pas interférer avec le chargement initial
    if (document.readyState === "complete") {
      // Si la page est déjà chargée (navigation client)
      preloadImportantData();
    } else {
      // Sinon attendre l'événement load
      window.addEventListener("load", preloadImportantData);

      return () => {
        window.removeEventListener("load", preloadImportantData);
      };
    }
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
