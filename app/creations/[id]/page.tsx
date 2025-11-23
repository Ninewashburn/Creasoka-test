"use client";
// Force TS refresh

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Share2, Calendar, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import ZoomableImage from "@/components/zoomable-image";
import Breadcrumb from "@/components/breadcrumb";
import { slugify, processMarkdownToHtml } from "@/lib/utils";
import { getFromCache } from "@/lib/clientCache";
import type { Creation } from "@/types/creation";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";

export default function CreationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const slugOrId = typeof params.id === "string" ? params.id : "";
  const [creation, setCreation] = useState<Creation | null>(null);
  const [allCreations, setAllCreations] = useState<Creation[]>([]);
  const [similarCreations, setSimilarCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Préparer les images pour la galerie
  const galleryImages = useMemo(() => {
    if (!creation) return [];
    const mainImage = creation.image ? [creation.image] : [];
    const additionalImages = (creation.images || []).filter((img: string) => img !== creation.image);
    const allImages = [...mainImage, ...additionalImages];
    return allImages.length > 0 ? allImages : ["/placeholder.svg"];
  }, [creation]);

  useEffect(() => {
    async function fetchAllCreations() {
      try {
        const cachedData = getFromCache<Creation[]>("allCreations");
        if (cachedData) {
          setAllCreations(cachedData);
        } else {
          const response = await fetch(`/api/creations`);
          if (response.ok) {
            const data = await response.json();
            setAllCreations(data);
          }
        }
      } catch {
        // Ignorer silencieusement
      }
    }
    fetchAllCreations();
  }, []);

  useEffect(() => {
    async function fetchCreation() {
      if (!slugOrId) return;

      // 1. Essayer de trouver depuis le cache
      if (allCreations.length > 0) {
        let cachedCreation;

        // Tenter de trouver par ID extrait si l'URL semble être un slug-id
        const lastDashIndex = slugOrId.lastIndexOf('-');
        if (lastDashIndex !== -1 && slugOrId.length - lastDashIndex <= 20) { // Heuristic: ID is usually short, e.g., cuid or uuid
          const potentialId = slugOrId.substring(lastDashIndex + 1);
          cachedCreation = allCreations.find((c) => c.id === potentialId);
        }

        // Si non trouvé par ID ou si l'URL n'est pas un slug-id, essayer par slug entier
        if (!cachedCreation) {
          cachedCreation = allCreations.find((c) => slugify(c.title) === slugOrId);
        }

        // Si toujours pas trouvé, tenter par ID direct (si l'URL était juste un ID)
        if (!cachedCreation) {
          cachedCreation = allCreations.find((c) => c.id === slugOrId);
        }

        if (cachedCreation) {
          setCreation(cachedCreation);
          setIsLoading(false);
          return;
        }
      }

      // 2. Si non trouvé dans le cache, faire l'appel API
      setIsLoading(true);
      try {
        const response = await fetch(`/api/creations/${slugOrId}`);
        if (response.ok) {
          const data = await response.json();
          setCreation(data);
        } else {
          notFound();
        }
      } catch {
        notFound();
      } finally {
        setIsLoading(false);
      }
    }

    // Attendre que allCreations soit potentiellement chargé depuis le cache
    if (allCreations.length > 0) {
      fetchCreation();
    } else {
      // Si allCreations est vide, on le charge, puis le useEffect dépendant de [allCreations] s'activera
      const timer = setTimeout(() => fetchCreation(), 100); // petit délai pour laisser le temps au cache
      return () => clearTimeout(timer);
    }
  }, [slugOrId, allCreations]);

  useEffect(() => {
    if (creation && allCreations.length > 0) {
      const similar = allCreations
        .filter((c: Creation) => {
          const creationCategories = Array.isArray(creation.categories) ? creation.categories : [];
          const itemCategories = Array.isArray(c.categories) ? c.categories : [];
          if (!itemCategories.length || !creationCategories.length) return false;
          return c.id !== creation.id && c.status !== "adopté" && itemCategories.some((cat) => creationCategories.includes(cat));
        })
        .slice(0, 4);
      setSimilarCreations(similar);
    }
  }, [creation, allCreations]);

  const { prevCreation, nextCreation } = useMemo(() => {
    if (allCreations.length === 0 || !creation) {
      return { prevCreation: null, nextCreation: null };
    }
    const currentIndex = allCreations.findIndex((c) => c.id === creation.id);
    if (currentIndex === -1) return { prevCreation: null, nextCreation: null };
    const prevCreation = currentIndex > 0 ? allCreations[currentIndex - 1] : null;
    const nextCreation = currentIndex < allCreations.length - 1 ? allCreations[currentIndex + 1] : null;
    return { prevCreation, nextCreation };
  }, [allCreations, creation]);

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

  const category = creation.categories && creation.categories.length > 0 ? creation.categories[0] : "bijoux";
  const categoryLabel = {
    bijoux: "Bijoux", minis: "Minis", chibi: "Chibi", halloween: "Halloween", pokemon: "Pokémon", divers: "Divers",
  }[category] || category;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Créations", href: "/#creations" },
          { label: categoryLabel, href: `/categories/${category}` },
          { label: creation.title },
        ]}
      />
      <div className="grid md:grid-cols-[1fr,400px] gap-8 lg:gap-12">
        <div className="grid lg:grid-cols-2 gap-8">
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
                    className={`rounded-md overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === index ? "border-creasoka ring-2 ring-creasoka ring-offset-2" : "border-gray-200 dark:border-gray-700"}`}
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
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">{creation.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    {creation.categories && creation.categories.map((cat, index) => (
                      <Badge key={index} variant="outline" className="text-sm">{{ bijoux: "Bijoux", minis: "Minis", chibi: "Chibi", halloween: "Halloween", pokemon: "Pokémon", divers: "Divers" }[cat] || cat}</Badge>
                    ))}
                    {creation.status === "nouveau" && <Badge className="bg-green-500 text-white">Nouveau</Badge>}
                    {creation.status === "vedette" && (
                      <Badge className="bg-creasoka text-lg py-1 px-3">En vedette</Badge>
                    )}
                    {creation.status === "promotion" && (
                      <Badge className="bg-pink-500 text-lg py-1 px-3">Promo</Badge>
                    )}
                    {creation.status === "adopté" && (
                      <Badge className="bg-red-500 text-lg py-1 px-3">Adopté</Badge>
                    )}      </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Créé le {new Date(creation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-creasoka">{creation.price} €</span>
                {creation.stock > 0 ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">En stock ({creation.stock})</Badge>
                ) : creation.status === "adopté" ? (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Adopté</Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Rupture de stock</Badge>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-creasoka" />Description</h2>
              <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: processMarkdownToHtml(creation.description) }}></div>
            </div>
            {creation.details && creation.details.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-creasoka" />Caractéristiques</h2>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                  <ul className="space-y-3">
                    {creation.details.map((detail: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-creasoka flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:sticky md:top-8 h-fit">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {creation.status === "adopté"
                ? "Cette création a été adoptée"
                : creation.status === "précommande"
                  ? "Disponible en précommande"
                  : "Intéressé(e) ?"}
            </h3>

            <div className="space-y-3">
              {creation.status === "précommande" ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href="/contact">Précommander</Link>
                </Button>
              ) : creation.status !== "adopté" ? (
                <>
                  <div className="flex flex-col gap-3 mt-6">
                    <Button
                      size="lg"
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => window.open(creation.externalLink || "#", "_blank")}
                      disabled={!creation.externalLink}
                    >
                      {creation.externalLink ? "Voir sur la boutique externe" : "Non disponible en ligne"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-12 border-purple-200 hover:bg-purple-50 text-purple-700"
                      onClick={() => addItem(creation)}
                      disabled={creation.stock === 0 || (creation.status as string) === "adopté"}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Ajouter au panier
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-12 flex items-center justify-center mt-3"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Partager
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    disabled
                    className="w-full opacity-70 cursor-not-allowed"
                  >
                    Déjà adopté
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center mt-2">
                    Cette création a été adoptée. Il est possible de repasser commande d&apos;un article similaire, mais étant une fabrication manuelle, le résultat peut varier légèrement.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Link href="/contact">Me contacter pour une commande</Link>
                  </Button>
                </>
              )}
            </div>
            {creation.customMessage && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">{creation.customMessage}</p>
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => router.back()} className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-creasoka transition-colors text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux créations
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreationNavigation prevCreation={prevCreation} nextCreation={nextCreation} />
      {similarCreations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Vous aimerez aussi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarCreations.map((similar) => (
              <motion.div key={similar.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="group">
                <Link href={`/creations/${slugify(similar.title)}-${similar.id}`} className="block">
                  <div className="relative overflow-hidden rounded-lg">
                    {similar.status === "nouveau" && <Badge className="absolute top-2 left-2 z-10 bg-green-500">Nouveau</Badge>}
                    {similar.status === "vedette" && <Badge className="absolute top-2 left-2 z-10 bg-creasoka">Vedette</Badge>}
                    {similar.status === "adopté" && <Badge className="absolute top-2 left-2 z-10 bg-red-500">Adopté</Badge>}
                    <Image src={similar.image || "/placeholder.svg"} alt={similar.title} width={300} height={300} className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium transition-colors group-hover:text-creasoka">{similar.title}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreationNavigation({ prevCreation, nextCreation }: { prevCreation: Creation | null, nextCreation: Creation | null }) {
  if (!prevCreation && !nextCreation) return null;

  return (
    <div className="mt-12 py-8 border-t border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        {prevCreation ? (
          <Link href={`/creations/${slugify(prevCreation.title)}`} className="flex items-center gap-2 text-gray-600 hover:text-creasoka transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <div>
              <p className="text-xs">Précédent</p>
              <p className="font-semibold">{prevCreation.title}</p>
            </div>
          </Link>
        ) : (
          <div></div>
        )}
        {nextCreation ? (
          <Link href={`/creations/${slugify(nextCreation.title)}`} className="flex items-center gap-2 text-gray-600 hover:text-creasoka transition-colors text-right">
            <div>
              <p className="text-xs">Suivant</p>
              <p className="font-semibold">{nextCreation.title}</p>
            </div>
            <ArrowRight className="h-5 w-5" />
          </Link>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
