"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import ZoomableImage from "@/components/zoomable-image";
import { slugify, processMarkdownToHtml } from "@/lib/utils";
import type { Creation } from "@/types/creation";

export default function CreationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = typeof params.id === "string" ? params.id : "";
  const [creation, setCreation] = useState<Creation | null>(null);
  const [similarCreations, setSimilarCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Préparer les images pour la galerie
  const galleryImages = useMemo(() => {
    if (!creation) return [];

    // Créer un tableau combinant l'image principale et les images additionnelles
    const mainImage = creation.image ? [creation.image] : [];
    const additionalImages = (creation.images || []).filter(
      (img: string) => img !== creation.image
    );

    const allImages = [...mainImage, ...additionalImages];
    return allImages.length > 0 ? allImages : ["/placeholder.svg"];
  }, [creation]);

  useEffect(() => {
    async function fetchCreation() {
      if (slugOrId) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/creations/${slugOrId}`);

          if (response.ok) {
            const data = await response.json();
            setCreation(data);
          } else {
            notFound();
          }
        } catch (error) {
          notFound();
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchCreation();
  }, [slugOrId]);

  // Récupérer des créations similaires (même catégorie)
  useEffect(() => {
    async function fetchSimilarCreations() {
      if (creation) {
        try {
          const response = await fetch(`/api/creations`);
          if (response.ok) {
            const allCreations = await response.json();
            // Filtrer pour avoir des créations de la même catégorie mais pas la même création
            const similar = allCreations
              .filter((c: Creation) => {
                // Vérifier si l'article a au moins une catégorie en commun avec l'article actuel
                const creationCategories = Array.isArray(creation.categories)
                  ? creation.categories
                  : creation.category
                  ? [creation.category]
                  : [];

                const itemCategories = Array.isArray(c.categories)
                  ? c.categories
                  : c.category
                  ? [c.category]
                  : [];

                if (!itemCategories.length || !creationCategories.length)
                  return false;

                return (
                  c.id !== creation.id &&
                  itemCategories.some((cat) => creationCategories.includes(cat))
                );
              })
              .slice(0, 4);
            setSimilarCreations(similar);
          }
        } catch (error) {
          // Ignorer silencieusement l'erreur dans les recommandations
          setSimilarCreations([]);
        }
      }
    }

    if (creation) {
      fetchSimilarCreations();
    }
  }, [creation]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <p className="mt-4 text-gray-500">Chargement de la création...</p>
        </div>
      </div>
    );
  }

  if (!creation) {
    notFound();
  }

  // Utiliser la première catégorie du tableau ou une valeur par défaut
  const category =
    creation.categories && creation.categories.length > 0
      ? creation.categories[0]
      : "bijoux";

  const categoryLabel =
    {
      bijoux: "Bijoux",
      minis: "Minis",
      halloween: "Halloween",
      pokemon: "Pokémon",
    }[category] || category;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-creasoka hover:text-creasoka/80 mb-6 border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="relative mb-4 rounded-lg overflow-hidden">
            <ZoomableImage
              src={galleryImages[selectedImage] || "/placeholder.svg"}
              alt={creation.title}
              width={600}
              height={600}
              className="w-full h-auto object-cover rounded-lg"
              galleryImages={galleryImages}
              galleryIndex={selectedImage}
              galleryTitles={Array(galleryImages.length).fill(creation.title)}
              onGalleryIndexChange={setSelectedImage}
            />
            {creation.status === "nouveau" && (
              <Badge className="absolute top-4 left-4 bg-green-500">
                Nouveau
              </Badge>
            )}
            {creation.status === "vedette" && (
              <Badge className="absolute top-4 left-4 bg-creasoka">
                Vedette
              </Badge>
            )}
            {creation.status === "adopté" && (
              <Badge className="absolute top-4 left-4 bg-red-500">Adopté</Badge>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-md overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-creasoka"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${creation.title} - vue ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {creation.categories &&
              creation.categories.map((cat, index) => {
                const catLabel =
                  {
                    bijoux: "Bijoux",
                    minis: "Minis",
                    halloween: "Halloween",
                    pokemon: "Pokémon",
                  }[cat] || cat;

                return (
                  <Badge key={index} variant="outline">
                    {catLabel}
                  </Badge>
                );
              })}
          </div>
          <h1 className="text-3xl font-bold mb-2">{creation.title}</h1>

          <div
            className="text-gray-700 dark:text-gray-300 mb-6 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: processMarkdownToHtml(creation.description),
            }}
          ></div>

          {creation.details && creation.details.length > 0 && (
            <div className="mb-6">
              <ul className="space-y-2">
                {creation.details.map((detail: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-creasoka mr-2">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-4">
            {creation.status !== "adopté" ? (
              <>
                <Button
                  size="lg"
                  className="bg-creasoka hover:bg-creasoka/90 text-white"
                >
                  Adopter cette création
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" /> Partager
                </Button>
              </>
            ) : (
              <Button size="lg" variant="destructive" disabled>
                Déjà adopté
              </Button>
            )}
          </div>
        </div>
      </div>

      {similarCreations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Vous aimerez aussi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarCreations.map((similar) => (
              <motion.div
                key={similar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Link
                  href={`/creations/${slugify(similar.title)}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    {similar.status === "nouveau" && (
                      <Badge className="absolute top-2 left-2 z-10 bg-green-500">
                        Nouveau
                      </Badge>
                    )}
                    {similar.status === "vedette" && (
                      <Badge className="absolute top-2 left-2 z-10 bg-creasoka">
                        Vedette
                      </Badge>
                    )}
                    {similar.status === "adopté" && (
                      <Badge className="absolute top-2 left-2 z-10 bg-red-500">
                        Adopté
                      </Badge>
                    )}
                    <Image
                      src={similar.image || "/placeholder.svg"}
                      alt={similar.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 text-lg font-medium transition-colors group-hover:text-creasoka">
                    {similar.title}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
