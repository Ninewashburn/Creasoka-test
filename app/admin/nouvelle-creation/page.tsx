"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import CreationForm from "@/components/admin/creation-form";

export default function NouvelleCreationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthLoading && !isAuthenticated) {
        router.push("/admin");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isAuthLoading, router]);

  // Si l'utilisateur n'est pas authentifié, on affiche un chargement
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creasoka mx-auto"></div>
          <p className="mt-4 text-gray-500">
            Vérification de l&apos;authentification...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/admin"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-creasoka mb-6 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          Ajouter une nouvelle création
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Complétez le formulaire ci-dessous pour ajouter une nouvelle création
          à votre galerie.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CreationForm mode="create" />
          </div>

          <div>
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold mb-2">Conseils</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start">
                    <span className="text-creasoka mr-2">•</span>
                    <span>
                      Utilisez des images de bonne qualité (idéalement carrées)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-creasoka mr-2">•</span>
                    <span>Soyez précis dans votre description</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-creasoka mr-2">•</span>
                    <span>Choisissez la catégorie appropriée</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-creasoka mr-2">•</span>
                    <span>
                      N&apos;oubliez pas d&apos;ajouter un lien Vinted si l&apos;article est à
                      vendre
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
