"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Creation } from "@/types/creation";
import CreationForm from "@/components/admin/creation-form";

export default function EditCreationPage() {
  const router = useRouter();
  const params = useParams();
  const slugOrId = typeof params.id === "string" ? params.id : "";
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [creation, setCreation] = useState<Creation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de la création directement depuis l'API
  useEffect(() => {
    async function fetchCreation() {
      if (!isAuthLoading && slugOrId) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/creations/${slugOrId}`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setCreation(data);
          } else {
            setError("Création non trouvée");
          }
        } catch {
          setError("Erreur lors du chargement des données");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchCreation();
  }, [isAuthLoading, slugOrId]);

  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthLoading && !isAuthenticated) {
        router.push("/admin");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isAuthLoading, router]);

  // Si l'utilisateur n'est pas authentifié ou en cours de chargement
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creasoka mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !creation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-gray-600 mb-4">{error || "Création non trouvée"}</p>
          <Link
            href="/admin"
            className="inline-flex items-center text-creasoka hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
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

        <h1 className="text-3xl font-bold mb-2">Modifier la création</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Modifiez les informations de votre création.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CreationForm mode="edit" creationId={creation.id} initialData={creation} />
          </div>

          <div>
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold mb-2">Aide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conseils pour éditer efficacement votre création
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
