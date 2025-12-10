"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { clientLogger } from "@/lib/client-logger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { StatusBadge } from "@/components/admin/status-badge";

interface OrderItem {
  creationId: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export default function UserAccountPage() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/mon-compte");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        clientLogger.error("Erreur chargement commandes", error);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (authLoading || (!isAuthenticated && loadingOrders)) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-creasoka" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon Compte</h1>
          <p className="text-gray-500">Gérez vos informations et suivez vos commandes</p>
        </div>
        <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700 border-red-200 bg-red-50 hover:bg-red-100">
          <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
        </Button>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-8 w-full justify-start h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <TabsTrigger value="orders" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 px-6 rounded-md">
            <Package className="mr-2 h-4 w-4" />
            Mes Commandes
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 px-6 rounded-md">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-6">
            {loadingOrders ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Chargement de vos commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Vous n&apos;avez pas encore passé de commande. Découvrez nos créations uniques !
                  </p>
                  <Button onClick={() => router.push("/#creations")} className="bg-creasoka hover:bg-creasoka/90 text-white">
                    Voir la boutique
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            Commande #{order.id.slice(0, 8)}
                          </CardTitle>
                          <StatusBadge status={order.status} />
                        </div>
                        <CardDescription>
                          Passée le {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{order.total.toFixed(2)} €</p>
                        <p className="text-sm text-gray-500">{order.items.length} article(s)</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="grid gap-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 border flex-shrink-0">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.title}</h4>
                              <p className="text-sm text-gray-500">
                                {item.quantity} x {item.price.toFixed(2)} €
                              </p>
                            </div>
                            <div className="font-medium">
                              {(item.quantity * item.price).toFixed(2)} €
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-2">Adresse de livraison</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>{order.shipping.firstName} {order.shipping.lastName}</p>
                          <p>{order.shipping.address}</p>
                          <p>{order.shipping.postalCode} {order.shipping.city}</p>
                          <p>{order.shipping.country}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Mes Informations</CardTitle>
              <CardDescription>
                Informations liées à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Nom complet</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                    {user.name || "Non renseigné"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                    {user.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Rôle</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border flex items-center gap-2">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Administrateur" : "Utilisateur"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">ID Compte</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border font-mono text-xs text-gray-500">
                    {user.id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
