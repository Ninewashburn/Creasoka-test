"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/commandes",
      label: "Commandes",
      icon: ShoppingCart,
      active: pathname.startsWith("/admin/commandes"),
    },
    {
      href: "/admin", // Temporary until we split creations page
      label: "Créations",
      icon: Package,
      active: pathname === "/admin/creations" || pathname === "/admin/nouvelle-creation",
    },
  ];

  return (
    <nav className="border-b bg-background mb-8">
      <div className="container mx-auto px-4 flex h-16 items-center gap-4">
        <div className="font-bold text-lg mr-4">Admin</div>
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "secondary" : "ghost"}
              asChild
              className={cn(
                "justify-start gap-2",
                item.active && "bg-muted"
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
