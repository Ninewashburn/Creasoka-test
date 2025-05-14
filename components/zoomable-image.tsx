"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ImageModal from "./image-modal";

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  galleryImages?: string[];
  galleryIndex?: number;
  galleryTitles?: string[];
  onGalleryIndexChange?: (newIndex: number) => void;
}

export default function ZoomableImage({
  src,
  alt,
  width,
  height,
  className = "",
  galleryImages,
  galleryIndex = 0,
  galleryTitles,
  onGalleryIndexChange,
}: ZoomableImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Si des images de galerie sont fournies, utilisez-les, sinon utilisez l'image actuelle
  const images = galleryImages || [src];
  const titles = galleryTitles || [alt];
  const currentIndex = galleryIndex || 0;

  // Vérifier si l'URL est valide (ne contient pas "placeholder.svg" si src est défini)
  const actualSrc =
    src && !src.includes("placeholder.svg") && src.trim() !== ""
      ? src
      : "/placeholder.svg";

  return (
    <>
      <motion.div
        className="cursor-zoom-in overflow-hidden"
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Image
          src={actualSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-transform duration-300 hover:scale-105`}
        />
      </motion.div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={images}
        currentIndex={currentIndex}
        titles={titles}
        onNavigate={onGalleryIndexChange}
      />
    </>
  );
}
