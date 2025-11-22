"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ExternalLink, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  status: string;
  price: number;
  stock: number;
  categories: string[];
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  titles?: string[];
  items?: GalleryItem[];
  onNavigate?: (newIndex: number) => void;
}

export default function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  titles = [],
  items = [],
  onNavigate,
}: ImageModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mettre à jour l'index actif lorsque l'index externe change
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  const navigateToImage = useCallback(
    (newIndex: number) => {
      const index = (newIndex + images.length) % images.length;
      setActiveIndex(index);
      if (onNavigate) {
        onNavigate(index);
      }
    },
    [images.length, onNavigate]
  );

  // Gérer les touches du clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateToImage(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        navigateToImage(activeIndex + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, navigateToImage, onClose]);

  // Empêcher le défilement du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Fermer uniquement si on clique sur l'arrière-plan, pas sur l'image ou les contrôles
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  const currentItem = items[activeIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/95 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-w-6xl w-full h-full flex flex-col bg-transparent rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 bg-black/80 backdrop-blur-sm rounded-t-lg flex-shrink-0 z-20 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
              <span className="text-white font-bold text-lg truncate">
                {currentItem?.title || titles[activeIndex]}
              </span>
              <span className="text-gray-400 text-sm whitespace-nowrap">
                Image {activeIndex + 1}/{images.length}
              </span>
            </div>

            {currentItem && (
              <div className="hidden md:flex gap-2 flex-shrink-0">
                {currentItem.status === "nouveau" && <Badge className="bg-green-500 hover:bg-green-600">Nouveau</Badge>}
                {currentItem.status === "vedette" && <Badge className="bg-creasoka hover:bg-creasoka/80">Vedette</Badge>}
                {currentItem.status === "promotion" && <Badge className="bg-pink-500 hover:bg-pink-600">Promo</Badge>}
                {currentItem.status === "adopté" && <Badge className="bg-red-500 hover:bg-red-600">Adopté</Badge>}
                {currentItem.status === "précommande" && <Badge className="bg-blue-500 hover:bg-blue-600">Précommande</Badge>}
              </div>
            )}

            {currentItem && (
              <div className="flex items-center gap-2 ml-auto mr-4 flex-shrink-0">
                <Link
                  href={`/creations/${slugify(currentItem.title)}`}
                  className="flex items-center justify-center gap-2 bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-gray-200 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Voir fiche</span>
                  <span className="sm:hidden">Voir</span>
                </Link>
                <Link
                  href={`/creations/${slugify(currentItem.title)}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-3 py-1.5 rounded-md font-medium hover:bg-white/20 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Nouvel onglet</span>
                  <span className="sm:hidden">Ouvrir</span>
                </Link>
              </div>
            )}
          </div>

          <button
            className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/20 flex-shrink-0"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Fermer</span>
          </button>
        </div>

        <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden bg-black/20">
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-gray-800/50 rounded-full p-2 hover:bg-gray-700/70"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToImage(activeIndex - 1);
                }}
              >
                <ChevronLeft className="h-8 w-8" />
                <span className="sr-only">Image précédente</span>
              </button>

              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-gray-800/50 rounded-full p-2 hover:bg-gray-700/70"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToImage(activeIndex + 1);
                }}
              >
                <ChevronRight className="h-8 w-8" />
                <span className="sr-only">Image suivante</span>
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center p-4 relative group"
            >
              <Image
                src={
                  images[activeIndex] &&
                    !images[activeIndex].includes("placeholder.svg")
                    ? images[activeIndex]
                    : "/placeholder.svg"
                }
                alt={titles[activeIndex] || `Image ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 80vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <div className="bg-black/80 backdrop-blur-sm p-3 flex justify-center gap-2 z-20 rounded-b-lg">
            <div className="flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${index === activeIndex
                    ? "bg-creasoka scale-125"
                    : "bg-white/50 hover:bg-white/80"
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToImage(index);
                  }}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
