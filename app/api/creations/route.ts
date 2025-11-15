import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { slugify } from "../../../lib/utils";
import { serverCache } from "../../../lib/cache";
import { logger } from "../../../lib/logger";

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
      logger.debug("POST /api/creations - Données manquantes:", body);
      return NextResponse.json(
        { error: "Titre, description et au moins une catégorie sont requis" },
        { status: 400 }
      );
    }

    // Créer un nouvel ID unique basé sur le titre slugifié
    const id = body.id || `${slugify(body.title)}-${Date.now()}`;

    // Définir les images et détails comme des tableaux vides s'ils ne sont pas fournis
    const images = body.images || [];
    const details = body.details || [];

    logger.debug("POST /api/creations - Tentative de création:", id);

    // Créer une nouvelle création dans la base de données
    const creation = await db.creation.create({
      data: {
        id,
        title: body.title,
        description: body.description,
        categories: body.categories,
        image: body.image || "/placeholder.svg",
        images,
        details,
        status: body.status || "normal",
        externalLink: body.externalLink || null,
        customMessage: body.customMessage || null,
      },
    });

    // Invalider le cache après création
    serverCache.invalidate("all-creations");

    logger.info("POST /api/creations - Création réussie:", id);

    return NextResponse.json(creation, { status: 201 });
  } catch (error) {
    logger.error("POST /api/creations - Erreur détaillée:", error);

    // Vérifier le type d'erreur et extraire les détails de façon sécurisée
    let errorMessage = "Erreur lors de la création";
    let errorDetails = "";

    if (error && typeof error === "object") {
      // Vérifier si c'est une erreur Prisma
      if ("name" in error && error.name === "PrismaClientKnownRequestError") {
        // Vérifier également l'existence de message
        if ("message" in error && typeof error.message === "string") {
          errorMessage = `Erreur de base de données: ${error.message}`;
        } else {
          errorMessage = "Erreur de base de données Prisma";
        }
      }

      // Extraire les détails si disponibles
      errorDetails =
        "message" in error && typeof error.message === "string"
          ? error.message
          : "Détails non disponibles";
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Utiliser le cache côté serveur avec une durée de 2 minutes
    const creations = await serverCache.get(
      "all-creations",
      async () => {
        return await db.creation.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      2 * 60 * 1000 // 2 minutes
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
