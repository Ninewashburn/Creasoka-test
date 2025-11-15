"use client";

import { Badge } from "@/components/ui/badge";
import ZoomableImage from "./zoomable-image";
import { motion } from "framer-motion";
import type { Creation } from "@/types/creation";

interface GalleryCardProps {
  creation: Creation;
}

export default function GalleryCard({ creation }: GalleryCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg group"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
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
        <Badge className="absolute top-2 left-2 z-10 bg-red-500">Adopté</Badge>
      )}

      <div className="relative">
        <ZoomableImage
          src={creation.image || "/placeholder.svg"}
          alt={creation.title}
          width={400}
          height={400}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="font-semibold text-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {creation.title}
          </h3>
          <p className="text-sm text-gray-200 capitalize transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            {creation.categories && creation.categories.length > 0
              ? creation.categories[0]
              : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
