"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Upload, Star, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { useToast } from "../../../hooks/use-toast";
import type { Creation } from "../../../types/creation";
import { useAuth } from "../../../hooks/use-auth";
import UploadImageInput from "../../../components/upload-image-input";
import RichTextEditor from "@/components/rich-text-editor";
import { slugify } from "@/lib/utils";

export default function NouvelleCreationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    categories: ["bijoux"],
    description: "",
    image: "",
    externalLink: "",
    customMessage: "",
    isNew: false,
    isFeatured: false,
    isAdopted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    let timer;
    // Ajouter un délai pour laisser le temps au hook useAuth de s'initialiser
    timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/admin");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          categories: [...prev.categories, category],
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== category),
        };
      }
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Empêcher les soumissions multiples
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Déterminer le statut en fonction des cases à cocher
      let status = "normal";
      if (formData.isNew) status = "nouveau";
      if (formData.isFeatured) status = "vedette";
      if (formData.isAdopted) status = "adopté";

      // Créer un ID basé sur le titre slugifié et horodaté
      const slugTitle = slugify(formData.title);
      const id = `${slugTitle}-${Date.now()}`;

      // Préparer les données pour l'API
      const creationData = {
        id,
        title: formData.title,
        categories: formData.categories as (
          | "bijoux"
          | "minis"
          | "halloween"
          | "pokemon"
          | "divers"
        )[],
        description: formData.description,
        image: formData.image || "/placeholder.svg",
        images: [],
        details: [],
        externalLink: formData.externalLink || null,
        status: status as "nouveau" | "vedette" | "normal" | "adopté",
        customMessage: formData.customMessage || null,
      };

      // Envoyer à l'API
      const response = await fetch("/api/creations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(creationData),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Afficher une notification de succès
        toast({
          title: "Création ajoutée",
          description:
            "La nouvelle création a été ajoutée avec succès à la base de données.",
          variant: "success",
        });

        // Réinitialiser le formulaire
        setFormData({
          title: "",
          categories: ["bijoux"],
          description: "",
          image: "",
          externalLink: "",
          customMessage: "",
          isNew: false,
          isFeatured: false,
          isAdopted: false,
        });

        // Rediriger vers la page d'administration
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de l'ajout de la création");

        toast({
          title: "Erreur d'API",
          description:
            errorData.error || "Erreur lors de l'ajout de la création",
          variant: "error",
        });
      }
    } catch (error) {
      setError("Erreur lors de l'envoi des données");

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si l'utilisateur n'est pas authentifié, on affiche un chargement
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creasoka mx-auto"></div>
          <p className="mt-4 text-gray-500">
            Vérification de l'authentification...
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label
                  htmlFor="title"
                  className="text-base font-medium flex items-center"
                >
                  Titre <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka"
                  placeholder="Bracelet en perles"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label className="text-base font-medium flex items-center mb-2">
                  Catégories <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="catBijoux"
                      checked={formData.categories.includes("bijoux")}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("bijoux", checked as boolean)
                      }
                    />
                    <Label htmlFor="catBijoux" className="cursor-pointer">
                      Bijoux
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="catMinis"
                      checked={formData.categories.includes("minis")}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("minis", checked as boolean)
                      }
                    />
                    <Label htmlFor="catMinis" className="cursor-pointer">
                      Figurines Miniatures
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="catHalloween"
                      checked={formData.categories.includes("halloween")}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("halloween", checked as boolean)
                      }
                    />
                    <Label htmlFor="catHalloween" className="cursor-pointer">
                      Halloween
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="catPokemon"
                      checked={formData.categories.includes("pokemon")}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("pokemon", checked as boolean)
                      }
                    />
                    <Label htmlFor="catPokemon" className="cursor-pointer">
                      Pokémon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="catDivers"
                      checked={formData.categories.includes("divers")}
                      onCheckedChange={(checked) =>
                        handleCategoryChange("divers", checked as boolean)
                      }
                    />
                    <Label htmlFor="catDivers" className="cursor-pointer">
                      Divers
                    </Label>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <UploadImageInput
                  label="Image principale"
                  required
                  value={formData.image}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      setFormData((prev) => ({ ...prev, image: value }));
                    } else if (Array.isArray(value) && value.length > 0) {
                      // Prend la première image si c'est un tableau (ne devrait pas arriver pour l'image principale)
                      setFormData((prev) => ({ ...prev, image: value[0] }));
                    } else {
                      // Cas par défaut ou tableau vide, mettre une chaîne vide
                      setFormData((prev) => ({ ...prev, image: "" }));
                    }
                  }}
                  description="Choisissez une image principale pour votre création"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <RichTextEditor
                  id="description"
                  label="Description"
                  value={formData.description}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  required
                  placeholder="Une description détaillée de votre création..."
                  className="transition-all duration-300 focus-within:ring-2 focus-within:ring-creasoka focus-within:border-creasoka"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <Label htmlFor="externalLink" className="text-base font-medium">
                  Lien Vinted (optionnel)
                </Label>
                <Input
                  id="externalLink"
                  name="externalLink"
                  value={formData.externalLink}
                  onChange={handleInputChange}
                  className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka"
                  placeholder="https://www.vinted.fr/..."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <Label
                  htmlFor="customMessage"
                  className="text-base font-medium"
                >
                  Message personnalisé (optionnel)
                </Label>
                <Textarea
                  id="customMessage"
                  name="customMessage"
                  value={formData.customMessage}
                  onChange={handleInputChange}
                  className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka"
                  rows={3}
                  placeholder="Ce bijou est fait à la main avec soin. Chaque pièce est unique et peut présenter de légères variations par rapport aux photos, ce qui fait tout son charme artisanal."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="flex space-x-8"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("isNew", checked as boolean)
                    }
                    className="data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                  />
                  <Label
                    htmlFor="isNew"
                    className="flex items-center cursor-pointer"
                  >
                    <Star className="h-4 w-4 mr-1 text-yellow-400" /> Marquer
                    comme nouveau
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("isFeatured", checked as boolean)
                    }
                    className="data-[state=checked]:bg-creasoka data-[state=checked]:border-creasoka"
                  />
                  <Label
                    htmlFor="isFeatured"
                    className="flex items-center cursor-pointer"
                  >
                    <Star className="h-4 w-4 mr-1 text-creasoka" /> Mettre en
                    vedette
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdopted"
                    checked={formData.isAdopted}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("isAdopted", checked as boolean)
                    }
                    className="data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400"
                  />
                  <Label
                    htmlFor="isAdopted"
                    className="flex items-center cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-1 text-green-400" /> Marquer
                    comme adopté
                  </Label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="flex justify-end space-x-4 pt-4"
              >
                <Link
                  href="/admin"
                  className="inline-flex items-center bg-black/90 text-white py-2 px-4 rounded-md hover:bg-black/70 transition-all duration-300 border border-gray-700"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center bg-black text-white py-2 px-4 rounded-md hover:bg-black/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </motion.div>
            </form>
          </div>

          <div>
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Prévisualisation</h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative bg-gray-100 dark:bg-gray-800 h-72 flex items-center justify-center">
                  {formData.image ? (
                    <Image
                      src={formData.image || "/placeholder.svg"}
                      alt={formData.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">
                    {formData.title || "Titre de la création"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-2">
                    {formData.description || "Description de la création..."}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm"
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
                      N'oubliez pas d'ajouter un lien Vinted si l'article est à
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
