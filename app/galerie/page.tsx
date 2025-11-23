"use client";

import { useState, useMemo, useEffect } from "react";


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ZoomableImage from "@/components/zoomable-image";
import type { Creation } from "@/types/creation";
import { getFromCache, setToCache } from "@/lib/clientCache";

const categoryTypes = [
  "bijoux",
  "minis",
  "chibi",
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

  useEffect(() => {
    async function fetchCreations() {
      try {
        setIsLoading(true);

        // Vérifier le cache d'abord
        const cachedData = getFromCache<Creation[]>("allCreations");
        if (cachedData) {
          setAllCreations(cachedData);
          setIsLoading(false);
          // Mettre à jour les données en arrière-plan
          fetchFromAPI();
          return;
        }

        // Si pas de cache, récupérer depuis l'API
        await fetchFromAPI();
      } catch (error) {
        console.error("Erreur lors du chargement des créations:", error);
        setIsLoading(false);
      }
    }

    async function fetchFromAPI() {
      try {
        const response = await fetch("/api/creations");
        if (response.ok) {
          const data = await response.json();
          setAllCreations(data);
          // Mettre en cache les données pour les utilisations futures
          setToCache("allCreations", data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement depuis l'API:", error);
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

      // Si la catégorie active est "adoptes", on ne montre que les adoptés
      if (activeCategory === "adoptes") {
        return matchesSearch && creation.status === "adopté";
      }

      // Pour les autres catégories
      const matchesCategory =
        activeCategory === "tous" ||
        (creation.categories &&
          categoryTypes.includes(activeCategory as ValidCategory) &&
          creation.categories.includes(activeCategory as ValidCategory));

      // Exclure les créations avec le statut "adopté" des autres onglets
      const isNotAdopted = creation.status !== "adopté";

      return matchesSearch && matchesCategory && isNotAdopted;
    });
  }, [allCreations, searchQuery, activeCategory]);

  // Préparer les données pour la section "Les Adoptés"
  // Filtrer par statut, recherche et catégorie active
  const adoptedCreations = useMemo(() => {
    // Si on est déjà sur l'onglet "Adoptés", on ne veut pas de doublons en bas
    if (activeCategory === "adoptes") return [];

    return allCreations.filter((c) => {
      const isAdopted = c.status === "adopté";
      const matchesSearch =
        searchQuery === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "tous" ||
        (c.categories &&
          categoryTypes.includes(activeCategory as ValidCategory) &&
          c.categories.includes(activeCategory as ValidCategory));

      return isAdopted && matchesSearch && matchesCategory;
    });
  }, [allCreations, searchQuery, activeCategory]);

  // Combiner toutes les créations visibles pour la navigation dans la modale
  const allVisibleCreations = useMemo(() => {
    return [...filteredCreations, ...adoptedCreations];
  }, [filteredCreations, adoptedCreations]);

  // Préparer les données pour la galerie (images et titres pour la modale)
  const galleryImages = useMemo(
    () => allVisibleCreations.map((c) => c.image || "/placeholder.svg"),
    [allVisibleCreations]
  );

  const galleryItems = useMemo(
    () => allVisibleCreations.map((c) => ({
      id: c.id,
      title: c.title,
      image: c.image || "/placeholder.svg",
      status: c.status,
      price: c.price,
      stock: c.stock,
      categories: c.categories
    })),
    [allVisibleCreations]
  );

  const categories = [
    { id: "tous", label: "Tous" },
    { id: "bijoux", label: "Bijoux" },
    { id: "minis", label: "Minis" },
    { id: "chibi", label: "Chibi" },
    { id: "halloween", label: "Halloween" },
    { id: "pokemon", label: "Pokémon" },
    { id: "divers", label: "Divers" },
    { id: "adoptes", label: "Adoptés" },
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
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded"
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
          {activeCategory === "adoptes"
            ? "Retrouvez ici toutes les créations ayant rejoint leur famille. Si l'une d'entre elles vous plaît, n'hésitez pas à me contacter. Prenez en compte que chaque création reste unique et s'il peut s'en approcher, ça ne sera jamais vraiment le même."
            : "Explorez l'ensemble de mes créations artisanales, des bijoux délicats aux figurines miniatures. Chaque pièce est unique et réalisée avec passion."}
        </p>
      </div>

      <div className="mb-12">
        <div className="relative w-full md:w-96 mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher une création..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Effacer</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <Tabs
          defaultValue="tous"
          className="w-full flex justify-center"
          onValueChange={setActiveCategory}
          value={activeCategory}
        >
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-2 bg-transparent">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  "data-[state=active]:bg-creasoka data-[state=active]:text-white rounded-full px-4 py-2 transition-all border border-transparent data-[state=inactive]:border-gray-200 dark:data-[state=inactive]:border-gray-700 hover:border-creasoka/50"
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
              {creation.status === "précommande" && (
                <Badge className="absolute top-2 left-2 z-10 bg-blue-500">
                  Précommande
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
                  className={cn(
                    "w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105",
                    creation.status === "adopté" && "brightness-90 grayscale-[0.5]"
                  )}
                  galleryImages={galleryImages}
                  galleryIndex={index}
                  galleryItems={galleryItems}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none group-hover:opacity-100 transition-opacity">
                  <h3 className="font-semibold text-lg">{creation.title}</h3>
                  <p className="text-sm text-gray-200 capitalize mb-3">
                    {creation.categories && creation.categories.length > 0
                      ? creation.categories[0]
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : filteredCreations.length === 0 && adoptedCreations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              Oups ! Aucune pépite trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Il semblerait que cette recherche ne donne rien pour le moment. Essayez d'autres mots-clés ou explorez une autre catégorie !
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
        ) : null}
      </motion.div>

      {adoptedCreations.length > 0 && activeCategory !== "adoptes" && (
        <div className={cn("mt-16", filteredCreations.length === 0 && "mt-0")}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Les <span className="text-creasoka">Adoptés</span>
              {searchQuery && (
                <span className="text-base font-normal ml-2">
                  correspondant à votre recherche
                </span>
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Ces créations ont déjà trouvé leur foyer. Découvrez les pièces qui
              ont fait le bonheur d&apos;autres passionnés.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptedCreations.map((creation, index) => (
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
                    galleryImages={galleryImages}
                    galleryIndex={filteredCreations.length + index}
                    galleryItems={galleryItems}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
