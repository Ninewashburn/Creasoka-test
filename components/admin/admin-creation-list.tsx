"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Creation } from "@/types/creation";

// ============================================================================
// API SERVICE
// ============================================================================

const creationsApi = {
    /**
     * Récupère toutes les créations
     */
    fetchCreations: async (): Promise<Creation[]> => {
        const response = await fetch("/api/creations");

        if (!response.ok) {
            throw new Error("Impossible de charger les créations");
        }

        return response.json();
    },

    /**
     * Supprime une création
     */
    deleteCreation: async (id: string): Promise<void> => {
        const response = await fetch(`/api/creations/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la suppression de la création");
        }
    }
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminCreationList() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ========================================================================
    // QUERIES & MUTATIONS
    // ========================================================================

    const {
        data: creations = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<Creation[], Error>({
        queryKey: ['admin-creations'],
        queryFn: creationsApi.fetchCreations,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const deleteMutation = useMutation({
        mutationFn: creationsApi.deleteCreation,
        onSuccess: () => {
            toast({
                title: "Succès",
                description: "La création a été supprimée.",
                variant: "success",
            });
            setDeletingId(null);
            queryClient.invalidateQueries({ queryKey: ['admin-creations'] });
        },
        onError: (error: Error) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de supprimer la création.",
                variant: "error",
            });
            setDeletingId(null);
        }
    });

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleDelete = (id: string) => {
        setDeletingId(id);
        deleteMutation.mutate(id);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500">Chargement des créations...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">Erreur de chargement</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {error?.message || "Impossible de charger les créations"}
                    </p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Titre</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {creations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <p>Aucune création trouvée</p>
                                        <Link href="/admin/nouvelle-creation">
                                            <Button variant="link" className="text-creasoka">
                                                Ajouter votre première création
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            creations.map((creation) => (
                                <TableRow key={creation.id}>
                                    <TableCell>
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                            <Image
                                                src={creation.image || "/placeholder.svg"}
                                                alt={creation.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-base">{creation.title}</span>
                                            <span className="text-sm text-gray-500 line-clamp-1 max-w-[300px]">
                                                {creation.description}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {creation.categories.map((cat) => (
                                                <Badge key={cat} variant="outline" className="text-xs font-normal bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
                                                    {cat}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(creation.price)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`${creation.stock === 0 ? 'text-red-500 font-medium' : 'text-gray-700'}`}>
                                            {creation.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={`capitalize font-normal ${
                                                creation.status === 'vedette' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                                creation.status === 'adopté' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                                'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {creation.status === 'vedette' ? 'En vedette' : creation.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/creations/${creation.id}`} target="_blank">
                                                <Button variant="ghost" size="icon" title="Voir">
                                                    <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/edit/${creation.id}`}>
                                                <Button variant="ghost" size="icon" title="Modifier">
                                                    <Edit className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                                                </Button>
                                            </Link>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" title="Supprimer">
                                                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action est irréversible. Cela supprimera définitivement la création
                                                            "{creation.title}" de votre boutique.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(creation.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            {deletingId === creation.id ? (
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                "Supprimer"
                                                            )}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
