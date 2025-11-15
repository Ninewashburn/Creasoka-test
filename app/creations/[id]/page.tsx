"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Share2, Calendar, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import ZoomableImage from "@/components/zoomable-image";
import Breadcrumb from "@/components/breadcrumb";
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
                  : [];

                const itemCategories = Array.isArray(c.categories)
                  ? c.categories
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
      divers: "Divers",
    }[category] || category;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Créations", href: "/#creations" },
          { label: categoryLabel, href: `/#creations?category=${category}` },
          { label: creation.title },
        ]}
      />

      <div className="grid md:grid-cols-[1fr,400px] gap-8 lg:gap-12">
        {/* Section Gauche - Contenu Principal */}
        <div className="space-y-6">
          {/* En-tête avec titre et badges */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                  {creation.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {creation.categories &&
                    creation.categories.map((cat, index) => {
                      const catLabel =
                        {
                          bijoux: "Bijoux",
                          minis: "Minis",
                          halloween: "Halloween",
                          pokemon: "Pokémon",
                          divers: "Divers",
                        }[cat] || cat;

                      return (
                        <Badge key={index} variant="outline" className="text-sm">
                          {catLabel}
                        </Badge>
                      );
                    })}
                  {creation.status === "nouveau" && (
                    <Badge className="bg-green-500 text-white">Nouveau</Badge>
                  )}
                  {creation.status === "vedette" && (
                    <Badge className="bg-creasoka text-white">Vedette</Badge>
                  )}
                  {creation.status === "adopté" && (
                    <Badge className="bg-red-500 text-white">Adopté</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Créé le{" "}
                  {new Date(creation.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Galerie d'images */}
          <div>
            <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <ZoomableImage
                src={galleryImages[selectedImage] || "/placeholder.svg"}
                alt={creation.title}
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-lg"
                galleryImages={galleryImages}
                galleryIndex={selectedImage}
                galleryTitles={Array(galleryImages.length).fill(creation.title)}
                onGalleryIndexChange={setSelectedImage}
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {galleryImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-md overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index
                        ? "border-creasoka ring-2 ring-creasoka ring-offset-2"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${creation.title} - vue ${index + 1}`}
                      width={120}
                      height={120}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-creasoka" />
              Description
            </h2>
            <div
              className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: processMarkdownToHtml(creation.description),
              }}
            ></div>
          </div>

          {/* Détails avec icônes */}
          {creation.details && creation.details.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-creasoka" />
                Caractéristiques
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <ul className="space-y-3">
                  {creation.details.map((detail: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-creasoka flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Section Droite - Actions Sticky */}
        <div className="md:sticky md:top-8 h-fit">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {creation.status === "adopté"
                ? "Cette création a été adoptée"
                : "Intéressé(e) ?"}
            </h3>

            <div className="space-y-3">
              {creation.status !== "adopté" ? (
                <>
                  <Button
                    size="lg"
                    className="w-full bg-creasoka hover:bg-creasoka/90 text-white"
                    onClick={() => {
                      if (creation.externalLink) {
                        window.open(creation.externalLink, "_blank");
                      }
                    }}
                    disabled={!creation.externalLink}
                    title={
                      creation.externalLink
                        ? "Voir sur Vinted"
                        : "Lien non disponible"
                    }
                  >
                    {creation.externalLink
                      ? "Adopter cette création"
                      : "Non disponible à l'adoption"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Partager
                  </Button>
                </>
              ) : (
                <Button size="lg" variant="destructive" disabled className="w-full">
                  Déjà adopté
                </Button>
              )}
            </div>

            {creation.customMessage && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {creation.customMessage}
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-creasoka transition-colors text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux créations
              </button>
            </div>
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
