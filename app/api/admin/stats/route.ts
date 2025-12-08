import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is exported from here, need to verify
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // verifyAuth() ne prend pas de paramètres et throw si non autorisé
    await verifyAuth();

    const [
      totalRevenueData,
      totalOrders,
      pendingOrders,
      shippedOrders
    ] = await Promise.all([
      // Total Revenue: Sum of orders that are paid/shipped/delivered
      prisma.order.aggregate({
        _sum: {
            total: true
        },
        where: {
            status: { in: ["paid", "shipped", "delivered"] }
        }
      }),
      
      // Total Orders count
      prisma.order.count(),
      
      // Pending/Paid (Needs processing)
      prisma.order.count({
        where: { status: { in: ["pending", "paid"] } }
      }),

      // For "Conversion" maybe we use Average Order Value or just Shipped count
      prisma.order.count({
        where: { status: "shipped" }
      })
    ]);

    const revenue = totalRevenueData._sum.total || 0;
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    return NextResponse.json({
      revenue,
      totalOrders,
      pendingOrders,
      averageOrderValue
    });
    
  } catch (error) {
    console.error("Error fetching admin stats:", error);

    // Si erreur d'authentification
    if (error instanceof Error && (error.message === "Non autorisé" || error.message === "Token invalide")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
