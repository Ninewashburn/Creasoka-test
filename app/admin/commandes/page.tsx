"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { OrderList } from "@/components/admin/order-list";
import { OrderDetailsDialog, type Order } from "@/components/admin/order-details-dialog";
import { useToast } from "@/hooks/use-toast";

import { Separator } from "@/components/ui/separator";

export default function AdminOrderPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/");
    }
  }, [isAuthenticated, user, isAuthLoading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders?admin=true");
      if (!response.ok) throw new Error("Erreur chargement commandes");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Erreur mise à jour");
    }

    // Update local state locally to avoid full re-fetch flicker
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    
    // Also update selected order if open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    
    // Refresh fully in background just in case
    fetchOrders();
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  if (isAuthLoading || !user) {
    return null; // Or skeleton
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <p className="text-muted-foreground mt-2">
          Gérez et suivez les commandes de la boutique ({orders.length} total)
        </p>
      </div>

      <OrderList
        orders={orders}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
