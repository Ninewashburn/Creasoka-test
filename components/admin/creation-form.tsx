"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Star, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Creation } from "@/types/creation";
import UploadImageInput from "@/components/upload-image-input";
import RichTextEditor from "@/components/rich-text-editor";
import { slugify } from "@/lib/utils";
import Link from "next/link";

type CategoryType = "bijoux" | "minis" | "halloween" | "pokemon" | "divers";

interface CreationFormProps {
    mode: "create" | "edit";
    creationId?: string;
    initialData?: Creation;
}

export default function CreationForm({ mode, creationId, initialData }: CreationFormProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        categories: (initialData?.categories || ["bijoux"]) as CategoryType[],
        description: initialData?.description || "",
        image: initialData?.image || "",
        images: initialData?.images || [],
        externalLink: initialData?.externalLink || "",
        customMessage: initialData?.customMessage || "",
        price: initialData?.price || 0,
        stock: initialData?.stock || 0,
        status: initialData?.status || "normal",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form data when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                categories: (initialData.categories || ["bijoux"]) as CategoryType[],
                description: initialData.description || "",
                image: initialData.image || "",
                images: initialData.images || [],
                externalLink: initialData.externalLink || "",
                customMessage: initialData.customMessage || "",
                price: initialData.price || 0,
                stock: initialData.stock || 0,
                status: initialData.status || "normal",
            });
        }
    }, [initialData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        setFormData((prev) => {
            if (checked) {
                return {
                    ...prev,
                    categories: [...prev.categories, category as CategoryType],
                };
            } else {
                return {
                    ...prev,
                    categories: prev.categories.filter((c) => c !== category),
                };
            }
        });
    };

    const handleStatusChange = (status: string, checked: boolean) => {
        if (checked) {
            setFormData((prev) => ({ ...prev, status: status as "nouveau" | "vedette" | "normal" | "adopté" | "précommande" | "promotion" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const creationData: Partial<Creation> = {
                title: formData.title,
                categories: formData.categories,
                description: formData.description,
                image: formData.image || "/placeholder.svg",
                images: formData.images,
                externalLink: formData.externalLink || undefined,
                status: formData.status as "nouveau" | "vedette" | "normal" | "adopté" | "promotion" | "précommande",
                customMessage: formData.customMessage || undefined,
                price: formData.price,
                stock: formData.stock,
            };

            if (mode === "create") {
                const slugTitle = slugify(formData.title);
                creationData.id = `${slugTitle}-${Date.now()}`;
                creationData.images = [];
                creationData.details = [];
            }

            const url = mode === "create" ? "/api/creations" : `/api/creations/${creationId}`;
            const method = mode === "create" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(creationData),
            });

            const responseData = await response.json();

            if (response.ok) {
                toast({
                    title: mode === "create" ? "Création ajoutée" : "Création mise à jour",
                    description:
                        mode === "create"
                            ? "La nouvelle création a été ajoutée avec succès."
                            : "La création a été mise à jour avec succès.",
                    variant: "success",
                });

                setTimeout(() => {
                    router.push("/admin");
                }, 1000);
            } else {
                toast({
                    title: "Erreur",
                    description: responseData.error || "Une erreur est survenue",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Label htmlFor="title" className="text-base font-medium flex items-center">
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

            {/* Categories */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Label className="text-base font-medium flex items-center mb-2">
                    Catégories <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                    {(["bijoux", "minis", "halloween", "pokemon", "divers"] as const).map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                                id={`cat${cat}`}
                                checked={formData.categories.includes(cat)}
                                onCheckedChange={(checked) =>
                                    handleCategoryChange(cat, checked as boolean)
                                }
                            />
                            <Label htmlFor={`cat${cat}`} className="cursor-pointer capitalize">
                                {cat === "minis" ? "Figurines Miniatures" : cat === "pokemon" ? "Pokémon" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Label>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Image */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-6"
            >
                <UploadImageInput
                    label="Image principale"
                    required
                    value={formData.image}
                    onChange={(value) => {
                        if (typeof value === "string") {
                            setFormData((prev) => ({ ...prev, image: value }));
                        } else if (Array.isArray(value) && value.length > 0) {
                            setFormData((prev) => ({ ...prev, image: value[0] }));
                        } else {
                            setFormData((prev) => ({ ...prev, image: "" }));
                        }
                    }}
                    description="Choisissez une image principale pour votre création"
                />

                <UploadImageInput
                    label="Images additionnelles"
                    multiple
                    value={formData.images}
                    onChange={(value) => {
                        if (Array.isArray(value)) {
                            setFormData((prev) => ({ ...prev, images: value }));
                        }
                    }}
                    description="Déposez des images ici ou cliquez pour parcourir"
                />
            </motion.div>

            {/* Description */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
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

            {/* External Link */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
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

            {/* Custom Message */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
            >
                <Label htmlFor="customMessage" className="text-base font-medium">
                    Message personnalisé (optionnel)
                </Label>
                <Textarea
                    id="customMessage"
                    name="customMessage"
                    value={formData.customMessage}
                    onChange={handleInputChange}
                    className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka"
                    rows={3}
                    placeholder="Ce bijou est fait à la main avec soin..."
                />
            </motion.div>

            {/* Price and Stock */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="grid grid-cols-2 gap-4"
            >
                <div>
                    <Label htmlFor="price" className="text-base font-medium flex items-center">
                        Prix (€) <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka"
                        placeholder="25.00"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="stock" className="text-base font-medium flex items-center">
                        Stock <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="mt-1 transition-all duration-300 focus:ring-2 focus:ring-creasoka focus:border-creasoka"
                        placeholder="5"
                        required
                    />
                </div>
            </motion.div>

            {/* Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
            >
                <Label className="text-base font-medium mb-2 block">Statut</Label>
                <div className="flex flex-wrap gap-4">
                    {[
                        { value: "nouveau", label: "Nouveau", icon: Star, color: "yellow" },
                        { value: "vedette", label: "En vedette", icon: Star, color: "creasoka" },
                        { value: "promotion", label: "Promotion", icon: Star, color: "pink" },
                        { value: "adopté", label: "Adopté", icon: Check, color: "green" },
                    ].map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                                id={status.value}
                                checked={formData.status === status.value}
                                onCheckedChange={(checked) =>
                                    handleStatusChange(status.value, checked as boolean)
                                }
                            />
                            <Label htmlFor={status.value} className="flex items-center cursor-pointer">
                                <status.icon className={`h-4 w-4 mr-1 text-${status.color}-500`} />
                                {status.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Submit Buttons */}
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

            {/* Preview */}
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
                    <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-creasoka">{formData.price} €</span>
                        <span className="text-sm text-gray-500">Stock: {formData.stock}</span>
                    </div>
                </div>
            </motion.div>
        </form>
    );
}
