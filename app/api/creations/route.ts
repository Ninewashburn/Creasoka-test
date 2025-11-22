import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverCache } from "@/lib/cache";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    logger.debug("POST /api/creations - Début de la requête");

    const body = await request.json();

    // Vérifier les données requises
    if (
      !body.title ||
      !body.description ||
      !body.categories ||
      body.categories.length === 0
    ) {
      return NextResponse.json(
        { error: "Titre, description et au moins une catégorie sont requis" },
        { status: 400 }
      );
    }

    // Définir les images et détails comme des tableaux vides s'ils ne sont pas fournis
    const images = body.images || [];
    const details = body.details || [];

    logger.debug("POST /api/creations - Tentative de création");

    // Créer une nouvelle création dans la base de données
    const creation = await prisma.creation.create({
      data: {
        title: body.title,
        description: body.description,
        categories: body.categories,
        image: body.image || "/placeholder.svg",
        images,
        details,
        status: body.status || "normal",
        externalLink: body.externalLink || undefined,
        customMessage: body.customMessage || undefined,
        price: body.price || 0,
        stock: body.stock || 0,
      },
    });

    // Invalider le cache après création
    serverCache.invalidate("all-creations");

    logger.info("POST /api/creations - Création réussie:", creation.id);

    return NextResponse.json(creation, { status: 201 });
  } catch (error) {
    logger.error("POST /api/creations - Erreur:", error);
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
