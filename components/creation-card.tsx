"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Creation } from "@/types/creation";
import { slugify } from "@/lib/utils";

interface CreationCardProps {
  creation: Creation;
}

export default function CreationCard({ creation }: CreationCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        {creation.status === "nouveau" && (
          <Badge className="absolute top-2 left-2 z-10 bg-green-500">
            Nouveau
          </Badge>
        )}
        {creation.status === "vedette" && (
          <Badge className="absolute top-2 left-2 z-10 bg-purple-500">
            Vedette
          </Badge>
        )}
        {creation.status === "adopté" && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500">
            Adopté
          </Badge>
        )}
        <Link href={`/creations/${slugify(creation.title)}`}>
          <div className="overflow-hidden">
            <Image
              src={creation.image || "/placeholder.svg"}
              alt={creation.title}
              width={400}
              height={400}
              className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        </Link>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {(creation.categories || [creation.category])
            .filter(Boolean)
            .map((cat, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Badge>
            ))}
        </div>
        <h3 className="font-semibold text-lg mb-2 hover:text-creasoka transition-colors duration-300">
          {creation.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {creation.description}
        </p>
        <div className="flex justify-end">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hover:bg-creasoka/10 hover:text-creasoka hover:border-creasoka transition-all duration-300"
          >
            <Link href={`/creations/${slugify(creation.title)}`}>
              Voir détail →
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
