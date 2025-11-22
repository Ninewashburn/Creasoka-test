"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, RefreshCw, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// TYPES
// ============================================================================

interface OrderItem {
    creationId: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    total: number;
    createdAt: string;
    shipping: {
        firstName: string;
        lastName: string;
        email: string;
        city: string;
        country: string;
    };
    items: OrderItem[];
    trackingNumber?: string;
}

interface OrdersResponse {
    orders: Order[];
}

interface ShipOrderParams {
    orderId: string;
    trackingNumber: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

const ordersApi = {
    /**
     * Récupère toutes les commandes admin
     */
    fetchOrders: async (): Promise<OrdersResponse> => {
        const response = await fetch("/api/orders?admin=true");

        if (!response.ok) {
            throw new Error("Impossible de charger les commandes");
        }

        return response.json();
    },

    /**
     * Marque une commande comme expédiée
     */
    shipOrder: async ({ orderId, trackingNumber }: ShipOrderParams): Promise<void> => {
        const response = await fetch("/api/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId,
                status: "shipped",
                trackingNumber,
            }),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la mise à jour de la commande");
        }
    }
};

// ============================================================================
// HELPERS
// ============================================================================

const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
        pending: {
            variant: "outline" as const,
            className: "bg-yellow-50 text-yellow-700 border-yellow-200",
            label: "En attente"
        },
        processing: {
            variant: "outline" as const,
            className: "bg-blue-50 text-blue-700 border-blue-200",
            label: "En préparation"
        },
        shipped: {
            variant: "outline" as const,
            className: "bg-purple-50 text-purple-700 border-purple-200",
            label: "Expédiée"
        },
        delivered: {
            variant: "outline" as const,
            className: "bg-green-50 text-green-700 border-green-200",
            label: "Livrée"
        },
        cancelled: {
            variant: "destructive" as const,
            className: "",
            label: "Annulée"
        }
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminOrderList() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // État local pour la dialog d'expédition
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // ========================================================================
    // QUERIES & MUTATIONS
    // ========================================================================

    /**
     * Query pour récupérer les commandes
     * Cache automatique avec stale time de 5 minutes
     */
    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<OrdersResponse, Error>({
        queryKey: ['admin-orders'],
        queryFn: ordersApi.fetchOrders,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    /**
     * Mutation pour expédier une commande
     * Invalide automatiquement le cache après succès
     */
    const shipMutation = useMutation({
        mutationFn: ordersApi.shipOrder,
        onSuccess: () => {
            toast({
                title: "Succès",
                description: "Commande marquée comme expédiée.",
                variant: "success",
            });

            // Reset du formulaire
            setIsDialogOpen(false);
            setTrackingNumber("");
            setSelectedOrder(null);

            // Invalide le cache → re-fetch automatique
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        },
        onError: (error: Error) => {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la mise à jour.",
                variant: "error",
            });
        }
    });

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleShipOrder = () => {
        if (!selectedOrder || !trackingNumber.trim()) return;

        shipMutation.mutate({
            orderId: selectedOrder.id,
            trackingNumber: trackingNumber.trim(),
        });
    };

    const handleDialogOpen = (order: Order, open: boolean) => {
        setIsDialogOpen(open);
        if (open) {
            setSelectedOrder(order);
            setTrackingNumber(""); // Reset à chaque ouverture
        } else {
            // Cleanup quand on ferme
            setSelectedOrder(null);
            setTrackingNumber("");
        }
    };

    // ========================================================================
    // RENDER CONDITIONS
    // ========================================================================

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500">Chargement des commandes...</p>
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
                        {error?.message || "Impossible de charger les commandes"}
                    </p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer
                </Button>
            </div>
        );
    }

    const orders: Order[] = data?.orders || [];

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Commandes Récentes</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {orders.length} commande{orders.length > 1 ? 's' : ''} au total
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Commande</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-8 w-8 text-gray-400" />
                                        <p>Aucune commande trouvée</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order: Order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        #{order.id.slice(-6)}
                                    </TableCell>

                                    <TableCell>
                                        {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: fr })}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {order.shipping.firstName} {order.shipping.lastName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {order.shipping.city}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {formatPrice(order.total)}
                                    </TableCell>

                                    <TableCell>
                                        {getStatusBadge(order.status)}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {order.status === "pending" || order.status === "processing" ? (
                                            <Dialog
                                                open={isDialogOpen && selectedOrder?.id === order.id}
                                                onOpenChange={(open) => handleDialogOpen(order, open)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        className="bg-creasoka hover:bg-creasoka/90"
                                                    >
                                                        <Truck className="w-4 h-4 mr-2" />
                                                        Expédier
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Expédier la commande #{order.id.slice(-6)}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Veuillez saisir le numéro de suivi pour confirmer l&apos;expédition.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="tracking" className="text-right">
                                                                N° Suivi
                                                            </Label>
                                                            <Input
                                                                id="tracking"
                                                                value={trackingNumber}
                                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                                className="col-span-3"
                                                                placeholder="ex: 1Z999AA101..."
                                                                disabled={shipMutation.isPending}
                                                            />
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsDialogOpen(false)}
                                                            disabled={shipMutation.isPending}
                                                        >
                                                            Annuler
                                                        </Button>
                                                        <Button
                                                            onClick={handleShipOrder}
                                                            disabled={!trackingNumber.trim() || shipMutation.isPending}
                                                        >
                                                            {shipMutation.isPending ? (
                                                                <>
                                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                                    Expédition...
                                                                </>
                                                            ) : (
                                                                "Confirmer l'expédition"
                                                            )}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <Button size="sm" variant="ghost" disabled>
                                                {order.status === "shipped" && "Expédiée"}
                                                {order.status === "delivered" && "Livrée"}
                                                {order.status === "cancelled" && "Annulée"}
                                            </Button>
                                        )}
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
