"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { creations } from "@/data/creations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Creation } from "@/types/creation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import UploadImageInput from "@/components/upload-image-input";
import UploadMultipleImages from "@/components/upload-multiple-images";
import RichTextEditor from "@/components/rich-text-editor";

export default function EditCreationPage() {
  const router = useRouter();
  const params = useParams();
  const slugOrId = typeof params.id === "string" ? params.id : "";
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [creation, setCreation] = useState<Creation | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    categories: [] as string[],
    description: "",
    image: "",
    images: [] as string[],
    externalLink: "",
    status: "normal",
    customMessage: "",
    details: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données de la création directement depuis l'API
  useEffect(() => {
    async function fetchCreation() {
      if (!isAuthLoading && slugOrId) {
        try {
          setIsLoading(true);
          // D'abord, essayer de récupérer depuis l'API
          const response = await fetch(`/api/creations/${slugOrId}`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Création récupérée:", data);
            setCreation(data);
            setFormData({
              title: data.title || "",
              categories: data.categories || [],
              description: data.description || "",
              image: data.image || "",
              images: data.images || [],
              externalLink: data.externalLink || "",
              status: data.status || "normal",
              customMessage:
                data.customMessage ||
                "Ce bijou est fait à la main avec soin. Chaque pièce est unique et peut présenter de légères variations par rapport aux photos, ce qui fait tout son charme artisanal.",
              details: data.details || [],
            });
          } else {
            // Si l'API échoue, essayer les données locales
            console.log(
              "Recherche dans les données locales pour slug/ID:",
              slugOrId
            );
            // Essayer de trouver par ID
            let localCreation = creations.find((c) => c.id === slugOrId);

            // Si non trouvé, essayer par slug
            if (!localCreation) {
              localCreation = creations.find(
                (c) => slugify(c.title) === slugOrId
              );
            }

            if (localCreation) {
              console.log(
                "Création trouvée dans les données locales:",
                localCreation
              );
              setCreation(localCreation);
              setFormData({
                title: localCreation.title || "",
                categories: localCreation.categories || [],
                description: localCreation.description || "",
                image: localCreation.image || "",
                images: localCreation.images || [],
                externalLink: localCreation.externalLink || "",
                status: localCreation.status || "normal",
                customMessage:
                  localCreation.customMessage ||
                  "Ce bijou est fait à la main avec soin. Chaque pièce est unique et peut présenter de légères variations par rapport aux photos, ce qui fait tout son charme artisanal.",
                details: localCreation.details || [],
              });
            } else {
              console.error(`Création avec slug/ID ${slugOrId} non trouvée`);
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement de la création:", error);
          setError("Erreur lors du chargement des données");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchCreation();
  }, [isAuthLoading, slugOrId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({ ...prev, status }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      // Préparer les données à envoyer
      const updatedCreation = {
        ...formData,
      };

      // Envoyer à l'API
      const response = await fetch(`/api/creations/${slugOrId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCreation),
      });

      if (response.ok) {
        toast({
          title: "Création mise à jour",
          description: "Les modifications ont été enregistrées avec succès.",
          variant: "success",
        });
        router.push("/admin");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      setError("Erreur lors de l'envoi des données");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <p className="mt-4 text-gray-500">Chargement de la création...</p>
        </div>
      </div>
    );
  }

  // Vérifier l'authentification après le chargement pour éviter une redirection prématurée
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
        <p className="mb-4">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Button asChild>
          <Link href="/admin">Aller à la page de connexion</Link>
        </Button>
      </div>
    );
  }

  if (!creation && !isLoading && !isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Création non trouvée</h1>
        <p className="mb-4">
          La création "{slugOrId}" n'existe pas dans la base de données.
        </p>
        <Button asChild>
          <Link href="/admin">Retour à l'administration</Link>
        </Button>
      </div>
    );
  }

  // Nous rendons le formulaire uniquement si création existe
  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-creasoka mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour au tableau de bord
      </Link>

      <h1 className="text-3xl font-bold mb-2">Modifier une création</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Modifiez les informations de votre création et téléversez de nouvelles
        images si nécessaire.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
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
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="categories"
                className="text-base font-medium flex items-center"
              >
                Catégories <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="mt-2 space-y-2">
                {["bijoux", "minis", "halloween", "pokemon", "divers"].map(
                  (category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="cursor-pointer"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <UploadImageInput
                label="Image principale"
                required={true}
                value={formData.image}
                onChange={(value) => handleSelectChange("image", value)}
                description="Choisissez une image principale"
              />
            </div>

            <div>
              <UploadMultipleImages
                label="Images additionnelles"
                values={formData.images}
                onChange={(values) =>
                  setFormData({ ...formData, images: values })
                }
                description="Déposez des images ici ou cliquez pour parcourir"
              />
            </div>

            <div>
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
            </div>

            <div>
              <Label htmlFor="externalLink" className="text-base font-medium">
                Lien Vinted (optionnel)
              </Label>
              <Input
                id="externalLink"
                name="externalLink"
                value={formData.externalLink}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="https://www.vinted.fr/..."
              />
            </div>

            <div>
              <Label htmlFor="customMessage" className="text-base font-medium">
                Message personnalisé
              </Label>
              <Textarea
                id="customMessage"
                name="customMessage"
                value={formData.customMessage}
                onChange={handleInputChange}
                className="mt-1"
                rows={3}
                placeholder="Ce bijou est fait à la main avec soin. Chaque pièce est unique et peut présenter de légères variations par rapport aux photos, ce qui fait tout son charme artisanal."
              />
            </div>

            <div>
              <Label className="text-base font-medium">Statut</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="normal"
                    checked={formData.status === "normal"}
                    onCheckedChange={(checked) =>
                      handleStatusChange("normal", checked === true)
                    }
                  />
                  <Label htmlFor="normal" className="cursor-pointer">
                    Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nouveau"
                    checked={formData.status === "nouveau"}
                    onCheckedChange={(checked) =>
                      handleStatusChange("nouveau", checked === true)
                    }
                  />
                  <Label htmlFor="nouveau" className="cursor-pointer">
                    Nouveau
                    <Badge className="ml-2 bg-green-500">Nouveau</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vedette"
                    checked={formData.status === "vedette"}
                    onCheckedChange={(checked) =>
                      handleStatusChange("vedette", checked === true)
                    }
                  />
                  <Label htmlFor="vedette" className="cursor-pointer">
                    Vedette
                    <Badge className="ml-2 bg-purple-500">Vedette</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adopte"
                    checked={formData.status === "adopté"}
                    onCheckedChange={(checked) =>
                      handleStatusChange("adopté", checked === true)
                    }
                  />
                  <Label htmlFor="adopte" className="cursor-pointer">
                    Adopté
                    <Badge className="ml-2 bg-red-500">Adopté</Badge>
                  </Label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin")}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer les modifications</Button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="font-bold text-xl mb-4">Aperçu</h2>

            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={formData.image || "/placeholder.svg"}
                  alt={formData.title}
                  width={400}
                  height={400}
                  className="w-full h-72 object-cover"
                />
              </div>

              <h3 className="font-bold text-lg">{formData.title}</h3>

              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category) => (
                  <Badge key={category} className="bg-creasoka">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                ))}
                {formData.status === "nouveau" && (
                  <Badge className="bg-green-500">Nouveau</Badge>
                )}
                {formData.status === "vedette" && (
                  <Badge className="bg-purple-500">Vedette</Badge>
                )}
                {formData.status === "adopté" && (
                  <Badge className="bg-red-500">Adopté</Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.description}
              </p>

              {formData.externalLink && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Lien externe :</span>{" "}
                  {formData.externalLink}
                </p>
              )}
            </div>
          </div>

          <TooltipProvider>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl">Aide</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Conseils pour éditer efficacement votre création
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-4 text-sm">
                <p>
                  <span className="font-medium">Titre :</span> Soyez concis mais
                  descriptif. Un bon titre aide à trouver votre création.
                </p>
                <p>
                  <span className="font-medium">Catégories :</span> Choisissez
                  les catégories qui correspondent le mieux à votre création.
                </p>
                <p>
                  <span className="font-medium">Description :</span> Décrivez
                  votre création en détail, incluez les matériaux utilisés et
                  les dimensions.
                </p>
                <p>
                  <span className="font-medium">Statut :</span> Utilisez le
                  statut pour indiquer si votre création est nouvelle, à mettre
                  en avant ou déjà vendue.
                </p>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
