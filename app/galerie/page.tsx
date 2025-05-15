"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ZoomableImage from "@/components/zoomable-image";
import type { Creation } from "@/types/creation";

const categoryTypes = [
  "bijoux",
  "minis",
  "halloween",
  "pokemon",
  "divers",
] as const;
type ValidCategory = (typeof categoryTypes)[number];

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("tous");
  const [allCreations, setAllCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    async function fetchCreations() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/creations");
        if (response.ok) {
          const data = await response.json();
          setAllCreations(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des créations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreations();
  }, []);

  const filteredCreations = useMemo(() => {
    return allCreations.filter((creation) => {
      const matchesSearch =
        creation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creation.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Vérifier si la catégorie active correspond à une des catégories de la création
      const matchesCategory =
        activeCategory === "tous" ||
        (creation.categories &&
          categoryTypes.includes(activeCategory as ValidCategory) &&
          creation.categories.includes(activeCategory as ValidCategory));

      // Exclure les créations avec le statut "adopté" des résultats principaux
      const isNotAdopted = creation.status !== "adopté";

      return matchesSearch && matchesCategory && isNotAdopted;
    });
  }, [allCreations, searchQuery, activeCategory]);

  // Préparer les données pour la galerie
  const galleryImages = useMemo(
    () => filteredCreations.map((c) => c.image || "/placeholder.svg"),
    [filteredCreations]
  );
  const galleryTitles = useMemo(
    () => filteredCreations.map((c) => c.title),
    [filteredCreations]
  );

  // Préparer les données pour la section "Les Adoptés" par catégorie
  const adoptedByCategory = useMemo(() => {
    if (activeCategory === "tous") return [];
    return allCreations.filter((c) => {
      // Vérifier si la création est adoptée et correspond à la catégorie active
      return (
        c.status === "adopté" &&
        activeCategory !== "tous" &&
        categoryTypes.includes(activeCategory as ValidCategory) &&
        c.categories &&
        c.categories.includes(activeCategory as ValidCategory)
      );
    });
  }, [activeCategory, allCreations]);

  const adoptedImages = useMemo(
    () => adoptedByCategory.map((c) => c.image || "/placeholder.svg"),
    [adoptedByCategory]
  );
  const adoptedTitles = useMemo(
    () => adoptedByCategory.map((c) => c.title),
    [adoptedByCategory]
  );

  // Préparer les données pour la section "Les Adoptés" globale
  // Filtrer également par recherche pour que les adoptés correspondent à la recherche
  const allAdopted = useMemo(() => {
    return allCreations.filter(
      (c) =>
        c.status === "adopté" &&
        (searchQuery === "" ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, allCreations]);
  const allAdoptedImages = useMemo(
    () => allAdopted.map((c) => c.image || "/placeholder.svg"),
    [allAdopted]
  );
  const allAdoptedTitles = useMemo(
    () => allAdopted.map((c) => c.title),
    [allAdopted]
  );

  const categories = [
    { id: "tous", label: "Tous" },
    { id: "bijoux", label: "Bijoux" },
    { id: "minis", label: "Minis" },
    { id: "halloween", label: "Halloween" },
    { id: "pokemon", label: "Pokémon" },
    { id: "divers", label: "Divers" },
  ];

  // Afficher un squelette de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Galerie de <span className="text-creasoka">Créations</span>
          </h1>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-3/4 mx-auto mb-2 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-2/4 mx-auto rounded"></div>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une création..."
              className="pl-10"
              disabled
            />
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-full rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-64 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Galerie de <span className="text-creasoka">Créations</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explorez l'ensemble de mes créations artisanales, des bijoux délicats
          aux figurines miniatures. Chaque pièce est unique et réalisée avec
          passion.
        </p>
      </div>

      <div className="mb-12">
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher une création..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="tous"
          className="w-full justify-center"
          onValueChange={setActiveCategory}
          value={activeCategory}
        >
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  "data-[state=active]:bg-creasoka/20 data-[state=active]:text-creasoka dark:data-[state=active]:bg-creasoka/30 dark:data-[state=active]:text-creasoka text-sm px-1 sm:text-base sm:px-3"
                )}
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredCreations.length > 0 ? (
          filteredCreations.map((creation, index) => (
            <div
              key={creation.id}
              className="relative overflow-hidden rounded-lg group"
            >
              {creation.status === "nouveau" && (
                <Badge className="absolute top-2 left-2 z-10 bg-green-500">
                  Nouveau
                </Badge>
              )}
              {creation.status === "vedette" && (
                <Badge className="absolute top-2 left-2 z-10 bg-creasoka">
                  Vedette
                </Badge>
              )}
              {creation.status === "adopté" && (
                <Badge className="absolute top-2 left-2 z-10 bg-red-500">
                  Adopté
                </Badge>
              )}

              <div className="relative">
                <ZoomableImage
                  src={creation.image || "/placeholder.svg"}
                  alt={creation.title}
                  width={400}
                  height={400}
                  className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                  galleryImages={galleryImages}
                  galleryIndex={index}
                  galleryTitles={galleryTitles}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none">
                  <h3 className="font-semibold text-lg">{creation.title}</h3>
                  <p className="text-sm text-gray-200 capitalize">
                    {creation.categories && creation.categories.length > 0
                      ? creation.categories[0]
                      : creation.category || ""}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : filteredCreations.length === 0 && allAdopted.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Essayez de modifier vos critères de recherche.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("tous");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : filteredCreations.length === 0 && allAdopted.length > 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              Aucune création disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Mais nous avons trouvé des créations adoptées qui correspondent à
              votre recherche.
            </p>
          </div>
        ) : null}
      </motion.div>

      {activeCategory !== "tous" && adoptedByCategory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Les Adoptés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptedByCategory.map((creation, index) => (
              <div
                key={creation.id}
                className="relative overflow-hidden rounded-lg group"
              >
                <Badge className="absolute top-2 left-2 z-10 bg-red-500">
                  Adopté
                </Badge>
                <div className="relative">
                  <ZoomableImage
                    src={creation.image || "/placeholder.svg"}
                    alt={creation.title}
                    width={400}
                    height={400}
                    className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105 brightness-90"
                    galleryImages={adoptedImages}
                    galleryIndex={index}
                    galleryTitles={adoptedTitles}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none">
                    <h3 className="font-semibold text-lg">{creation.title}</h3>
                    <p className="text-sm text-gray-200 capitalize">
                      {creation.categories && creation.categories.length > 0
                        ? creation.categories[0]
                        : creation.category || ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Les Adoptés globale */}
      {allAdopted.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">
            Les <span className="text-creasoka">Adoptés</span>
            {searchQuery && (
              <span className="text-base font-normal ml-2">
                correspondant à votre recherche
              </span>
            )}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Ces créations ont déjà trouvé leur foyer. Découvrez les pièces qui
            ont fait le bonheur d'autres passionnés.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAdopted.map((creation, index) => (
              <div
                key={creation.id}
                className="relative overflow-hidden rounded-lg group"
              >
                <Badge className="absolute top-2 left-2 z-10 bg-red-500">
                  Adopté
                </Badge>
                <div className="relative">
                  <ZoomableImage
                    src={creation.image || "/placeholder.svg"}
                    alt={creation.title}
                    width={400}
                    height={400}
                    className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105 brightness-90"
                    galleryImages={allAdoptedImages}
                    galleryIndex={index}
                    galleryTitles={allAdoptedTitles}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none">
                    <h3 className="font-semibold text-lg">{creation.title}</h3>
                    <p className="text-sm text-gray-200 capitalize">
                      {creation.categories && creation.categories.length > 0
                        ? creation.categories[0]
                        : creation.category || ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
