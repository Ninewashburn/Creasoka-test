"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreationCard from "@/components/creation-card";
import type { Creation } from "@/types/creation";

export default function AllCreationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCreations = creations.filter((creation) => {
    const matchesSearch =
      creation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creation.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Exclure les créations avec le statut "adopté"
    const isNotAdopted = creation.status !== "adopté";

    return matchesSearch && isNotAdopted;
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
          <span className="text-gray-800 dark:text-gray-200">Toutes nos</span>{" "}
          <span className="text-purple-500">Créations</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Découvrez l'ensemble de notre collection de créations artisanales. Des
          bijoux aux figurines, explorez toutes nos pièces uniques faites avec
          passion.
        </p>
      </motion.div>

      <motion.div
        className="relative max-w-md mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

        <Input
          type="text"
          placeholder="Rechercher une création..."
          className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka hover:border-creasoka"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={searchQuery}
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
