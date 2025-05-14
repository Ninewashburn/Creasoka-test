import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { slugify } from "../../../lib/utils";

export async function POST(request: NextRequest) {
  try {
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

    // Créer un nouvel ID unique basé sur le titre slugifié
    const id = body.id || `${slugify(body.title)}-${Date.now()}`;

    // Définir les images et détails comme des tableaux vides s'ils ne sont pas fournis
    const images = body.images || [];
    const details = body.details || [];

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

    return NextResponse.json(creation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const creations = await db.creation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(creations);
  } catch (error) {
    console.error("Erreur lors de la récupération des créations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créations" },
      { status: 500 }
    );
  }
}
