"use client";

import Image from "next/image";
import Link from "next/link";

export default function CategorySection() {
  const categories = [
    {
      id: "bijoux",
      title: "Bijoux",
      description: "Pièces uniques pour sublimer vos tenues",
      image: "/images/creations/categorie_bijoux.webp",
    },
    {
      id: "minis",
      title: "Figurines Mini",
      description: "Mondes miniatures sculptés à la main",
      image: "/images/creations/categorie_minis.webp",
    },
    {
      id: "halloween",
      title: "Halloween",
      description: "Créations effrayantes pour une ambiance festive",
      image: "/images/creations/categorie_halloween.webp",
    },
    {
      id: "pokemon",
      title: "Pokémon",
      description: "Attrapez-les tous, version artisanale !",
      image: "/images/creations/categorie_minis.webp",
    },
    {
      id: "divers",
      title: "Divers",
      description: "Objets variés issus de mon imagination",
      image: "/images/creations/categorie_divers.webp",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.id}`}>
          <div className="relative overflow-hidden rounded-lg group cursor-pointer shadow-md hover:shadow-xl transition-all duration-150">
            <div className="transform transition-transform duration-150 hover:scale-105">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
              <h3 className="font-semibold text-lg group-hover:text-creasoka transition-colors duration-150">
                {category.title}
              </h3>
              <p className="text-sm text-gray-200">{category.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
