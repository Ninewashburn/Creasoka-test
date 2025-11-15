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
  priority?: boolean;
}

export default function ZoomableImage({
  src,
  alt,
  width,
  height,
  className,
  galleryImages,
  galleryIndex = 0,
  galleryTitles,
  onGalleryIndexChange,
  priority = false,
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(galleryIndex);

  // Mise à jour de l'index lorsque galleryIndex change
  useEffect(() => {
    setCurrentIndex(galleryIndex);
  }, [galleryIndex]);

  // Handler pour l'ouverture de la modale
  const handleOpen = () => {
    setIsOpen(true);
  };

  // Handler pour la fermeture de la modale
  const handleClose = () => {
    setIsOpen(false);
  };

  // Handler pour la navigation dans la galerie
  const handleNavigate = (newIndex: number) => {
    setCurrentIndex(newIndex);
    if (onGalleryIndexChange) {
      onGalleryIndexChange(newIndex);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="cursor-zoom-in relative"
        onClick={handleOpen}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className || ""}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={80}
        />
      </motion.div>

      {isOpen && galleryImages && galleryImages.length > 0 && (
      <ImageModal
          isOpen={isOpen}
          onClose={handleClose}
          images={galleryImages}
        currentIndex={currentIndex}
          titles={galleryTitles}
          onNavigate={handleNavigate}
      />
      )}
    </>
  );
}
