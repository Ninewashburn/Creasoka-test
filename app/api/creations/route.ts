import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverCache } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { creationSchema } from "@/lib/schemas";
import { verifyAuth } from "@/lib/auth";

export const runtime = "nodejs";


export async function POST(request: NextRequest) {
  try {
    logger.debug("POST /api/creations - Début de la requête");

    // Authentication check
    try {
      const auth = await verifyAuth();
      if (auth.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    // Validation Zod
    const validatedData = creationSchema.parse(body);

    logger.debug("POST /api/creations - Tentative de création");

    // Créer une nouvelle création dans la base de données
    const creation = await prisma.creation.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        categories: validatedData.categories,
        image: validatedData.image || "/placeholder.svg",
        images: validatedData.images || [],
        details: validatedData.details || [],
        status: validatedData.status,
        externalLink: validatedData.externalLink || undefined,
        customMessage: validatedData.customMessage || undefined,
        price: validatedData.price,
        stock: validatedData.stock,
      },
    });

    // Invalider le cache après création
    serverCache.invalidate("all-creations");

    logger.info("POST /api/creations - Création réussie:", creation.id);

    return NextResponse.json(creation, { status: 201 });
  } catch (error) {
    logger.error("POST /api/creations - Erreur:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Utiliser le cache serveur pour optimiser les performances
    const creations = await serverCache.get(
      "all-creations",
      async () => {
        return await prisma.creation.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      5 * 60 * 1000 // Cache de 5 minutes
    );

    return NextResponse.json(creations);
  } catch (error) {
    logger.error("Erreur lors de la récupération des créations:", error);

    let errorMessage = "Erreur lors de la récupération des créations";
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      errorMessage += `: ${error.message}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
