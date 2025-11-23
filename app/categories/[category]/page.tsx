"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AdvancedSearch from "@/components/advanced-search";
import { motion, AnimatePresence } from "framer-motion";
import CreationCard from "@/components/creation-card";
import { notFound } from "next/navigation";
import type { Creation } from "@/types/creation";

// Définition du type pour les catégories valides
type CategoryType = "bijoux" | "minis" | "chibi" | "halloween" | "pokemon" | "divers";

export default function CategoryPage() {
  const params = useParams();
  const category = typeof params.category === "string" ? params.category : "";
  const [filters, setFilters] = useState({
    query: "",
    minPrice: 0,
    maxPrice: 200,
    sort: "newest" as "newest" | "oldest" | "price-asc" | "price-desc",
  });
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [creations, setCreations] = useState<Creation[]>([]);

  useEffect(() => {
    setMounted(true);
    async function fetchCreations() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/creations");
        if (response.ok) {
          const data = await response.json();
          setCreations(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des créations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreations();
  }, []);

  const validCategories: CategoryType[] = [
    "bijoux",
    "minis",
    "chibi",
    "halloween",
    "pokemon",
    "divers",
  ];
  if (!validCategories.includes(category as CategoryType)) {
    notFound();
  }

  const categoryLabels: Record<string, string> = {
    bijoux: "Bijoux",
    minis: "Figurines Miniatures",
    chibi: "Chibi",
    halloween: "Halloween",
    pokemon: "Pokémon",
    divers: "Divers",
  };

  const categoryDescriptions: Record<string, string> = {
    bijoux:
      "Découvrez ma collection de bijoux faits main. Chaque pièce est unique et réalisée avec soin pour apporter une touche d'originalité à vos tenues.",
    minis:
      "Explorez mon univers de figurines miniatures. Chaque création est minutieusement sculptée et peinte à la main pour donner vie à des mondes féeriques et enchanteurs.",
    chibi:
      "Découvrez mes créations Chibi. Des personnages mignons et stylisés, parfaits pour les fans de culture pop et d'art mignon.",
    halloween:
      "Découvrez mes créations inspirées de l'univers d'Halloween. Des décorations originales pour créer une ambiance festive et mystérieuse.",
    pokemon:
      "Explorez ma collection de créations inspirées de l'univers Pokémon. Des pièces uniques pour les fans de tous âges.",
    divers:
      "Découvrez mes autres créations variées. Une collection diverse d'objets originaux et uniques faits main avec passion.",
  };

  const filteredCreations = creations
    .filter((creation) => {
      const matchesCategory =
        (creation.categories &&
          creation.categories.includes(category as CategoryType)) ||
        (creation as { category?: string }).category === category;

      const matchesSearch =
        creation.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        creation.description.toLowerCase().includes(filters.query.toLowerCase());

      const matchesPrice =
        (creation.price || 0) >= filters.minPrice &&
        (creation.price || 0) <= filters.maxPrice;

      // Exclure les créations avec le statut "adopté"
      const isNotAdopted = creation.status !== "adopté";

      return matchesCategory && matchesSearch && matchesPrice && isNotAdopted;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  };

  if (!mounted) return null;

  // Afficher un skeleton loader pendant le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-64 mx-auto mb-4 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-full max-w-md mx-auto rounded"></div>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Chargement..."
            className="pl-10"
            disabled
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-64 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-gray-800 dark:text-gray-200">
            {category === "minis" ? "Figurines" : categoryLabels[category]}
          </span>{" "}
          <span className="text-purple-500">
            {category === "minis" ? "Miniatures" : "Artisanaux"}
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {categoryDescriptions[category]}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AdvancedSearch
          onSearch={(newFilters) => setFilters(newFilters)}
          initialFilters={filters}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={category + filters.query + filters.sort}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCreations.length > 0 ? (
            filteredCreations.map((creation) => (
              <motion.div
                key={creation.id}
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <CreationCard key={creation.id} creation={creation} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="col-span-full text-center py-12"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos critères de recherche.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
