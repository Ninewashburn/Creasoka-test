"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, User, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface OrderItem {
    id: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
}

interface Order {
    id: string;
    date: string;
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    total: number;
    items: OrderItem[];
    shipping: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
}

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/user/profile");
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des commandes:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creasoka"></div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
            case "paid":
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Payée</Badge>;
            case "shipped":
                return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Expédiée</Badge>;
            case "delivered":
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Livrée</Badge>;
            case "cancelled":
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Annulée</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-8">Mon Espace <span className="text-creasoka">Client</span></h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Profil */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-creasoka" />
                                    Mes Informations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-20 h-20 rounded-full bg-creasoka/20 flex items-center justify-center text-creasoka text-2xl font-bold mb-3">
                                        {user.name.charAt(0)}
                                    </div>
                                    <h3 className="font-semibold text-lg">{user.name}</h3>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                    <Badge variant="secondary" className="mt-2">
                                        {user.role === "admin" ? "Administrateur" : "Membre"}
                                    </Badge>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <div className="text-gray-600 dark:text-gray-300">
                                            <p>{user.address}</p>
                                            <p>{user.postalCode} {user.city}</p>
                                            <p>{user.country}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-4 w-4 flex items-center justify-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/forgot-password">
                                            Modifier mon mot de passe
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full justify-start"
                                        onClick={logout}
                                    >
                                        Déconnexion
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Historique des commandes */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-creasoka" />
                                    Historique de Commandes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingOrders ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                                        ))}
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-6">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="bg-gray-50 dark:bg-gray-800 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-gray-500">Commande effectuée le</div>
                                                        <div className="font-medium">{formatDate(order.date)}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-gray-500">Total</div>
                                                        <div className="font-medium">{order.total.toFixed(2)} €</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-gray-500">N° de commande</div>
                                                        <div className="font-mono text-sm">{order.id}</div>
                                                    </div>
                                                    <div>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                </div>

                                                <div className="p-4">
                                                    <div className="space-y-4">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-4">
                                                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-sm">{item.title}</h4>
                                                                    <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                                                                </div>
                                                                <div className="font-medium text-sm">
                                                                    {item.price.toFixed(2)} €
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                                        <div className="flex items-start gap-2 text-sm text-gray-500">
                                                            <MapPin className="h-4 w-4 mt-0.5" />
                                                            <div>
                                                                <span className="block text-xs mb-1">Livré à :</span>
                                                                <span className="block text-gray-700 dark:text-gray-300">{order.shipping.address}</span>
                                                                <span className="block text-gray-700 dark:text-gray-300">{order.shipping.postalCode} {order.shipping.city}, {order.shipping.country}</span>
                                                            </div>
                                                        </div>
                                                        {/* Future feature: Link to order details */}
                                                        {/* <Button variant="ghost" size="sm" className="text-creasoka hover:text-creasoka/80">
                              Voir détails <ChevronRight className="h-4 w-4 ml-1" />
                            </Button> */}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
                                        <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
                                        <Button asChild>
                                            <Link href="/galerie">Découvrir nos créations</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
