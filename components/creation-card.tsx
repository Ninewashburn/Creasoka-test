"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Creation } from "@/types/creation";
import { slugify } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";

interface CreationCardProps {
  creation: Creation;
}

export default function CreationCard({ creation }: CreationCardProps) {
  const { addItem } = useCart();
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
          <Badge className="absolute top-2 right-2 bg-creasoka">
            En vedette
          </Badge>
        )}
        {creation.status === "promotion" && (
          <Badge className="absolute top-2 right-2 bg-pink-500">Promo</Badge>
        )}
        {creation.status === "adopté" && (
          <Badge className="absolute top-2 right-2 bg-red-500">Adopté</Badge>
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
          {(creation.categories || []).filter(Boolean).map((cat, index) => (
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
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-lg text-creasoka">
            {creation.price} €
          </span>
          {creation.stock === 0 && creation.status !== "adopté" && (
            <span className="text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
              Rupture
            </span>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-creasoka/10 hover:text-creasoka hover:border-creasoka transition-all duration-300"
          >
            <Link href={`/creations/${slugify(creation.title)}`}>
              Voir détail
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={creation.stock === 0 && creation.status !== "adopté" || creation.status === "adopté"}
            onClick={(e) => {
              e.preventDefault();
              addItem(creation);
            }}
            title="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Ajouter au panier</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
