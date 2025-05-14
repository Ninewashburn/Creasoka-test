"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  titles?: string[];
  onNavigate?: (newIndex: number) => void;
}

export default function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  titles = [],
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/95 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-w-4xl w-full h-full flex flex-col bg-transparent rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm rounded-t-lg flex-shrink-0">
          <div className="text-white font-medium text-lg truncate pr-4">
            {titles[activeIndex] || `Image ${activeIndex + 1}/${images.length}`}
          </div>
          <button
            className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Fermer</span>
          </button>
        </div>

        <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden bg-black/20 rounded-b-lg">
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-gray-800/50 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToImage(activeIndex - 1);
                }}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Image précédente</span>
              </button>

              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-gray-800/50 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToImage(activeIndex + 1);
                }}
              >
                <ChevronRight className="h-6 w-6" />
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
              className="w-full h-full flex items-center justify-center p-4"
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
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-purple-500"
                    : "bg-gray-400 hover:bg-gray-300"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToImage(index);
                }}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
