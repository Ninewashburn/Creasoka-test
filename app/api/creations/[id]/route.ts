import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverCache } from "@/lib/cache";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Récupérer une création par son ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params;

    const creation = await prisma.creation.findUnique({
      where: { id },
    });

    if (!creation) {
      return NextResponse.json(
        { error: "Création non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(creation);
  } catch (error) {
    logger.error("Erreur lors de la récupération de la création:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la création" },
      { status: 500 }
    );
  }
}

// Mettre à jour une création
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params;
    const body = await request.json();

    logger.debug(`PUT /api/creations/${id} - Mise à jour`);

    // Vérifier si la création existe
    const existingCreation = await prisma.creation.findUnique({
      where: { id },
    });

    if (!existingCreation) {
      return NextResponse.json(
        { error: "Création non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la création
    const updatedCreation = await prisma.creation.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        categories: body.categories,
        image: body.image,
        images: body.images || [],
        details: body.details || [],
        status: body.status,
        externalLink: body.externalLink || undefined,
        customMessage: body.customMessage || undefined,
        price: body.price,
        stock: body.stock,
      },
    });

    // Invalider le cache
    serverCache.invalidate("all-creations");

    logger.info(`PUT /api/creations/${id} - Mise à jour réussie`);

    return NextResponse.json(updatedCreation);
  } catch (error) {
    logger.error("Erreur lors de la mise à jour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// Supprimer une création
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params;

    logger.debug(`DELETE /api/creations/${id} - Suppression`);

    // Vérifier si la création existe
    const existingCreation = await prisma.creation.findUnique({
      where: { id },
    });

    if (!existingCreation) {
      return NextResponse.json(
        { error: "Création non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la création
    await prisma.creation.delete({
      where: { id },
    });

    // Invalider le cache
    serverCache.invalidate("all-creations");

    logger.info(`DELETE /api/creations/${id} - Suppression réussie`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
