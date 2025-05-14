"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Plus, LogOut, Lock } from "lucide-react";
import { creations } from "@/data/creations";
import type { Creation } from "@/types/creation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { slugify } from "@/lib/utils";

export default function AdminPage() {
  const [creationsList, setCreationsList] = useState<Creation[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCreations, setLoadingCreations] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, login, logout, user } = useAuth();

  // Vérifier si une mise à jour a été effectuée
  useEffect(() => {
    const updated = searchParams.get("updated");
    if (updated === "true") {
      // Utiliser un setTimeout pour éviter les problèmes de rendu
      const timer = setTimeout(() => {
        toast({
          title: "Création mise à jour",
          description: "Les modifications ont été enregistrées avec succès.",
          variant: "success",
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, toast]);

  // Charger les créations depuis l'API lors du chargement initial
  useEffect(() => {
    async function fetchCreationsFromAPI() {
      if (isAuthenticated) {
        try {
          setLoadingCreations(true);
          const response = await fetch("/api/creations", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setCreationsList(data);
          } else {
            setError("Impossible de charger les créations");
          }
        } catch (error) {
          setError("Problème lors du chargement des créations");
        } finally {
          setLoadingCreations(false);
        }
      }
    }

    if (isAuthenticated) {
      fetchCreationsFromAPI();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError("Le mot de passe est requis");
      setIsSubmitting(false);
      return;
    }

    // Utiliser la fonction login du hook useAuth
    const loginSuccess = await login(email, password);

    if (!loginSuccess) {
      setError("Identifiants incorrects");
    }

    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteCreation = async (id: string) => {
    try {
      // Appeler l'API pour supprimer la création en base de données
      const response = await fetch(`/api/creations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.status}`);
      }

      // Mettre à jour l'interface utilisateur après la suppression
      setCreationsList((prev) => prev.filter((creation) => creation.id !== id));

      toast({
        title: "Création supprimée",
        description:
          "La création a été supprimée avec succès de la base de données.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description:
          "La création n'a pas pu être supprimée. Veuillez réessayer.",
        variant: "error",
      });
    }
  };

  // Rediriger vers la page d'accueil si l'utilisateur accède directement à l'URL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="w-16 h-16 border-4 border-creasoka border-t-transparent rounded-full animate-spin mx-auto"></div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Chargement</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vérification de l'authentification en cours...
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, afficher le formulaire de connexion
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Lock className="mx-auto h-12 w-12 text-creasoka" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-bold">Administration</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Veuillez vous authentifier pour accéder à cette page
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                disabled={isSubmitting}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </div>
            <div>
              <Button
                type="submit"
                className="w-full bg-creasoka hover:bg-creasoka/90 transition-all duration-300 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push("/")}
                className="text-gray-500 hover:text-creasoka transition-colors duration-300"
              >
                Retour à l'accueil
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié, afficher le panneau d'administration
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">
              Panneau d'administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos créations, ajoutez de nouveaux articles et mettez à jour
              votre galerie
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-1">
                Connecté en tant que: {user.email}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
            <a
              href="/admin/nouvelle-creation"
              className="inline-flex items-center bg-black text-white py-2 px-4 rounded-md hover:bg-black/80 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" /> Nouvelle création
            </a>
            <Button
              onClick={handleLogout}
              className="inline-flex items-center bg-black/90 text-white py-2 px-4 rounded-md hover:bg-black/70 transition-all duration-300 border border-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border rounded-lg overflow-hidden shadow-md"
        >
          <h2 className="text-xl font-semibold p-4 bg-gray-50 dark:bg-gray-800">
            Vos créations
          </h2>

          {/* Version desktop du tableau */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {creationsList.map((creation, index) => (
                  <motion.tr
                    key={creation.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <td className="px-4 py-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="overflow-hidden rounded-md"
                      >
                        <Image
                          src={creation.image || "/placeholder.svg"}
                          alt={creation.title}
                          width={60}
                          height={60}
                          className="rounded-md object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </motion.div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{creation.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {creation.description.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(creation.categories || [])
                          .filter(Boolean)
                          .map((cat, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {cat === "bijoux" && "Bijoux"}
                              {cat === "minis" && "Minis"}
                              {cat === "halloween" && "Halloween"}
                              {cat === "pokemon" && "Pokémon"}
                              {![
                                "bijoux",
                                "minis",
                                "halloween",
                                "pokemon",
                              ].includes(cat) && cat}
                            </Badge>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {creation.status === "nouveau" && (
                        <Badge className="bg-green-500">Nouveau</Badge>
                      )}
                      {creation.status === "vedette" && (
                        <Badge className="bg-creasoka">En vedette</Badge>
                      )}
                      {creation.status === "adopté" && (
                        <Badge className="bg-red-500">Adopté</Badge>
                      )}
                      {creation.status === "normal" && (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Link
                              href={`/creations/${slugify(creation.title)}`}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Voir</span>
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Link
                              href={`/admin/edit/${slugify(creation.title)}`}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Modifier</span>
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCreation(creation.id)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile avec cartes */}
          <div className="md:hidden">
            <div className="space-y-4 p-4">
              {loadingCreations ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-creasoka border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : creationsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune création trouvée
                </div>
              ) : (
                creationsList.map((creation, index) => (
                  <motion.div
                    key={creation.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="overflow-hidden rounded-md"
                        >
                          <Image
                            src={creation.image || "/placeholder.svg"}
                            alt={creation.title}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </motion.div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {creation.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {creation.description.substring(0, 80)}...
                        </p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {(creation.categories || [])
                            .filter(Boolean)
                            .map((cat, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {cat === "bijoux" && "Bijoux"}
                                {cat === "minis" && "Minis"}
                                {cat === "halloween" && "Halloween"}
                                {cat === "pokemon" && "Pokémon"}
                                {![
                                  "bijoux",
                                  "minis",
                                  "halloween",
                                  "pokemon",
                                ].includes(cat) && cat}
                              </Badge>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {creation.status === "nouveau" && (
                              <Badge className="bg-green-500">Nouveau</Badge>
                            )}
                            {creation.status === "vedette" && (
                              <Badge className="bg-creasoka">En vedette</Badge>
                            )}
                            {creation.status === "adopté" && (
                              <Badge className="bg-red-500">Adopté</Badge>
                            )}
                            {creation.status === "normal" && (
                              <Badge variant="outline">Normal</Badge>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8"
                            >
                              <Link
                                href={`/creations/${slugify(creation.title)}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8"
                            >
                              <Link
                                href={`/admin/edit/${slugify(creation.title)}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCreation(creation.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
