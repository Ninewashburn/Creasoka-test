"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FeaturedCreations from "@/components/featured-creations";
import CategorySection from "@/components/category-section";
import { motion } from "framer-motion";

const testimonials = [
  {
    author: "JesstheWitch",
    creationName: "Goupix",
    creationSlug: "goupix",
    imageUrl: "/images/creations/717f2de2-d4ae-439a-b917-d75b9587013e.jpeg",
    comment: "Superbe objet, trop mignon, personne sérieuse, envoi parfait.",
  },
  {
    author: "Mlle_Malefoy",
    creationName: "Psykokwak",
    creationSlug: "psykokwak",
    imageUrl: "/images/creations/79445423-b089-4c52-882c-b7293e7d1ed0.jpeg",
    comment:
"Bonjour, j'ai bien reçu le colis rien n'est casser et c'est très choupi, j'ai hâte de lui offrir, je sais qu'il va adorer et je sais que ça va aller dans notre déco ! Merci beaucoup"  },
  {
    author: "El_Rsl",
    creationName: "Ronflex",
    creationSlug: "ronflex",
    imageUrl: "/images/creations/71f44914-9612-4a9c-8eca-163b3c51cc52.jpeg",
    comment: "C'est magnifique ce que vous faites !",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/70 to-purple-700/70 z-10" />
        <Image
          src="/placeholder.svg?height=600&width=1200"
          alt="Créations artisanales"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Créations Artisanales Uniques
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-lg md:text-xl max-w-2xl mb-8"
          >
            Des figurines Pokémon et bijoux faits à la main avec amour et
            passion, pour ajouter une touche de magie à votre collection
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full"
          >
            <div className="flex justify-center">
              <Link
                href="/galerie"
                className="inline-flex items-center justify-center bg-creasoka hover:bg-creasoka/90 text-white font-medium py-3 px-6 rounded-md transition-all duration-100"
              >
                Découvrir la Galerie <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-transparent border border-white text-white font-medium py-3 px-6 rounded-md hover:bg-white/10 transition-all duration-100"
              >
                Me contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Creations */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="text-purple-500">Créations</span> en Vedette
          </h2>
          <Link
            href="/galerie"
            className="text-purple-500 hover:text-purple-600 text-sm transition-colors duration-100"
          >
            Voir toute la galerie →
          </Link>
        </div>
        <FeaturedCreations />
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/images/creations/creasoka_carre.webp"
                alt="Créations Crea'Soka"
                width={600}
                height={400}
                className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-100"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                À propos de <span className="text-purple-500">Crea'Soka</span>
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Chez Crea'Soka, je crée des pièces artisanales uniques. Chaque
                pièce est minutieusement conçue et fabriquée à la main dans mon
                atelier, avec une attention particulière portée aux détails et à
                la qualité.
              </p>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Je m'inspire de mes passions et j'utilise ma touche personnelle,
                pour créer des objets qui racontent une histoire et apportent
                chaleur et originalité à votre intérieur ou à vos tenues.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-all duration-100 hover:-translate-y-1">
                  <h3 className="text-lg font-semibold mb-2 text-purple-500">
                    Matériaux de qualité
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sélectionnés avec soin pour leur durabilité et leur
                    esthétique
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-all duration-100 hover:-translate-y-1">
                  <h3 className="text-lg font-semibold mb-2 text-purple-500">
                    Fait à la main
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chaque pièce est unique et créée avec passion
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-100"
              >
                <Link href="/contact">Me contacter</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Découvrez nos <span className="text-purple-500">Catégories</span>
        </h2>
        <CategorySection />
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Ce que disent nos <span className="text-purple-500">clients</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-100 hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <Image
                      src={testimonial.imageUrl}
                      alt={testimonial.creationName}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.author}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.creationName}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic flex-grow">
                  "{testimonial.comment}"
                </p>
                <Link
                  href={`/creations/${testimonial.creationSlug}`}
                  className="text-sm text-purple-500 hover:underline mt-4 self-start"
                  target="_blank" // Optional: Open in new tab
                  rel="noopener noreferrer" // Optional: Security for new tab
                >
                  Voir la création →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
