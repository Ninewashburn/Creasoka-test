import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Package, MapPin, User, Mail, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  creationId: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
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

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onStatusUpdate,
}: OrderDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await onStatusUpdate(order.id, newStatus);
      toast({
        title: "Statut mis à jour",
        description: `La commande est maintenant ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl">Commande #{order.id.slice(0, 8)}</DialogTitle>
            <StatusBadge status={order.status} className="text-sm px-3 py-1" />
          </div>
          <DialogDescription>
            Passée le {format(new Date(order.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Informations Client */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Client
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">{order.shipping.firstName} {order.shipping.lastName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3 h-3" />
                <a href={`mailto:${order.shipping.email}`} className="hover:underline">
                  {order.shipping.email}
                </a>
              </div>
            </div>
          </div>

          {/* Informations Livraison */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Livraison
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
              <p>{order.shipping.address}</p>
              <p>{order.shipping.postalCode} {order.shipping.city}</p>
              <p>{order.shipping.country}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Articles */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-4 h-4" /> Articles ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg">
                <div className="relative w-16 h-16 rounded overflow-hidden bg-background border">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qté: {item.quantity} x {item.price} €</p>
                </div>
                <p className="font-semibold">{item.quantity * item.price} €</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de la commande</p>
              <p className="text-2xl font-bold text-primary">{order.total.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
          <span className="font-medium text-sm">Mettre à jour le statut :</span>
          <div className="flex items-center gap-3">
            <Select
              disabled={isUpdating}
              value={order.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="shipped">Expédié</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
