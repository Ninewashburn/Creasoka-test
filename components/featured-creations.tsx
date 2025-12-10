"use client";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { Creation } from "@/types/creation";
import { slugify } from "@/lib/utils";
import { getFromCache, setToCache } from "@/lib/clientCache";
import { clientLogger } from "@/lib/client-logger";

// Clé de cache pour les créations vedettes
const CACHE_KEY = "featuredCreations";

export default function FeaturedCreations() {
  const [featuredCreations, setFeaturedCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedCreations() {
      try {
        setIsLoading(true);

        // Vérifier le cache
        const cachedData = getFromCache<Creation[]>(CACHE_KEY);
        if (cachedData) {
          setFeaturedCreations(cachedData);
          setIsLoading(false);
          // Mettre à jour les données en arrière-plan
          fetchDataFromAPI();
          return;
        }

        // Si pas de cache ou cache expiré, charger les données normalement
        await fetchDataFromAPI();
      } catch (error) {
        clientLogger.error(
          "Erreur lors du chargement des créations vedettes",
          error
        );
        setIsLoading(false);
      }
    }

    async function fetchDataFromAPI() {
      try {
        const response = await fetch("/api/creations");
        if (response.ok) {
          const allCreations = await response.json();
          const featured = allCreations
            .filter((creation: Creation) => creation.status === "vedette")
            .slice(0, 3);

          // Mettre à jour l'état
          setFeaturedCreations(featured);

          // Mettre en cache les données
          setToCache(CACHE_KEY, featured);
        }
      } catch (error) {
        clientLogger.error("Erreur lors du chargement depuis l'API", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedCreations();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-64 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featuredCreations.map((creation, index) => (
        <motion.div
          key={creation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Link
            href={`/creations/${slugify(creation.title)}`}
            className="block"
          >
            <div className="relative overflow-hidden rounded-lg">
              <Badge className="absolute top-2 left-2 z-10 bg-purple-500">
                Vedette
              </Badge>
              <Image
                src={creation.image || "/placeholder.svg"}
                alt={creation.title}
                width={400}
                height={300}
                className="w-full h-64 object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-end p-4">
                <div className="text-white">
                  <h3 className="font-semibold text-lg">{creation.title}</h3>
                  <p className="text-sm text-gray-200">
                    {creation.categories && creation.categories.length > 0
                      ? creation.categories[0]
                      : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-purple-500 mb-1">
                {creation.categories && creation.categories.length > 0
                  ? creation.categories[0]
                  : ""}
              </div>
              <h3 className="font-semibold text-lg">{creation.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                {creation.description}
              </p>
              <Button
                variant="link"
                className="p-0 h-auto mt-2 text-purple-600 dark:text-purple-400 group-hover:underline transition-all duration-150"
              >
                Voir détail →
              </Button>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
