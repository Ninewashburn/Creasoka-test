import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { slugify } from "../../../../lib/utils";

// Récupérer une création par son ID ou son slug
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    let creation;

    // D'abord, essayer de trouver par ID
    creation = await db.creation.findUnique({
      where: { id: idOrSlug },
    });

    // Si non trouvé, chercher par slug (titre slugifié)
    if (!creation) {
      const allCreations = await db.creation.findMany();
      creation = allCreations.find((c) => slugify(c.title) === idOrSlug);
    }

    if (!creation) {
      return NextResponse.json(
        { error: "Création non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(creation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la création" },
      { status: 500 }
    );
  }
}

// Mettre à jour une création
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    const body = await request.json();
    let existingCreation;

    // D'abord, essayer de trouver par ID
    existingCreation = await db.creation.findUnique({
      where: { id: idOrSlug },
    });

    // Si non trouvé, chercher par slug (titre slugifié)
    if (!existingCreation) {
      const allCreations = await db.creation.findMany();
      existingCreation = allCreations.find(
        (c) => slugify(c.title) === idOrSlug
      );
    }

    if (!existingCreation) {
      return NextResponse.json(
        { error: "Création non trouvée" },
        { status: 404 }
      );
    }

    try {
      // Mettre à jour la création en utilisant l'ID réel
      const updatedCreation = await db.creation.update({
        where: { id: existingCreation.id },
        data: {
          title: body.title,
          description: body.description,
          categories: body.categories || [],
          image: body.image,
          images: body.images || [],
          details: body.details || [],
          status: body.status,
          externalLink: body.externalLink || null,
          customMessage: body.customMessage || null,
        },
      });

      return NextResponse.json(updatedCreation);
    } catch (updateError) {
      console.error("Erreur spécifique lors de la mise à jour:", updateError);
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour: ${updateError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la création" },
      { status: 500 }
    );
  }
}

// Supprimer une création
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    let existingCreation;

    // D'abord, essayer de trouver par ID
    existingCreation = await db.creation.findUnique({
      where: { id: idOrSlug },
    });

    // Si non trouvé, chercher par slug (titre slugifié)
    if (!existingCreation) {
      const allCreations = await db.creation.findMany();
      existingCreation = allCreations.find(
        (c) => slugify(c.title) === idOrSlug
      );
    }

    if (!existingCreation) {
      return NextResponse.json(
        { error: "Création non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la création en utilisant l'ID réel
    await db.creation.delete({
      where: { id: existingCreation.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la création" },
      { status: 500 }
    );
  }
}
