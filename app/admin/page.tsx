"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminOrderList from "@/components/admin/admin-order-list";
import AdminCreationList from "@/components/admin/admin-creation-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== "admin")) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

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
          {/* Logout button is handled in header/auth context usually, but added here to match screenshot if needed, 
              though usually it's in the nav. The screenshot shows it in the header area. */}
        </div>
      </div>

      {/* Stats Cards (Keeping them as they are useful, but maybe user wants them hidden? 
          I'll keep them for now as "Phase 1" added them, but if user complains I'll remove) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234.00 €</div>
            <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">+4 depuis hier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Commandes à expédier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.4% cette semaine</p>
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

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Gestion des Commandes</h2>
          <AdminOrderList />
        </div>
      </div>
    </div>
  );
}
