import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as Status;

  const styles = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
    paid: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200",
    delivered: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  };

  const labels = {
    pending: "En attente",
    paid: "Payé",
    shipped: "Expédié",
    delivered: "Livré",
    cancelled: "Annulé",
  };

  const style = styles[normalizedStatus] || "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
  const label = labels[normalizedStatus] || status;

  return (
    <Badge variant="outline" className={cn(style, "whitespace-nowrap", className)}>
      {label}
    </Badge>
  );
}
