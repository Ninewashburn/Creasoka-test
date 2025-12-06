import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import type { Order } from "./order-details-dialog";

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (order: Order) => void;
}

export function OrderList({ orders, isLoading, onViewDetails }: OrderListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center bg-white dark:bg-gray-800">
        <p className="text-muted-foreground animate-pulse">Chargement des commandes...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center bg-white dark:bg-gray-800">
        <p className="text-lg font-medium">Aucune commande trouvée</p>
        <p className="text-muted-foreground">Les commandes apparaîtront ici une fois passées.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white dark:bg-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
              <TableCell>
                {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: fr })}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{order.shipping.firstName} {order.shipping.lastName}</span>
                  <span className="text-xs text-muted-foreground">{order.shipping.email}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{order.total.toFixed(2)} €</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(order)}
                  title="Voir détails"
                >
                  <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
