"use client";

import { logger } from "@/lib/sentry";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminCreationList from "@/components/admin/admin-creation-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface AdminStats {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    revenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== "admin")) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    async function fetchStats() {
        try {
            const response = await fetch("/api/admin/stats");
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            logger.error("Failed to fetch stats", error);
        }
    }
    if (isAuthenticated && user?.role === "admin") {
        fetchStats();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section matching screenshot */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Panneau d&apos;administration</h1>
          <p className="text-gray-500 text-sm mb-1">
            Gérez vos créations, ajoutez de nouveaux articles et mettez à jour votre galerie
          </p>
          <p className="text-gray-400 text-xs">
            Connecté en tant que: <span className="font-medium">{user.email}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/nouvelle-creation">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle création
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">Total des commandes payées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Commandes totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Commandes à traiter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Moyenne par commande</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Creations List Section */}
        <Card className="border-none shadow-sm">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl">Vos créations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <AdminCreationList />
            </CardContent>
        </Card>

        {/* Orders Management Link */}
        <Card className="border-none shadow-sm bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold mb-2">Gestion des Commandes</h2>
                <p className="text-muted-foreground">
                    Accédez à la page dédiée pour gérer les commandes, les expéditions et les statuts.
                </p>
            </div>
            <Link href="/admin/commandes">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Gérer les commandes <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
