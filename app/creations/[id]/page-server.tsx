import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import CreationDetailClient from "./client";

interface PageProps {
  params: { id: string };
}

// Generate dynamic metadata for each product page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slugOrId = params.id;

  // Try to find the creation
  let creation;

  // Try by slug-id format first (title-slug-id)
  const lastDashIndex = slugOrId.lastIndexOf('-');
  if (lastDashIndex !== -1 && slugOrId.length - lastDashIndex <= 20) {
    const potentialId = slugOrId.substring(lastDashIndex + 1);
    creation = await prisma.creation.findUnique({
      where: { id: potentialId },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        images: true,
        price: true,
        stock: true,
        categories: true,
      },
    });
  }

  // If not found, try by direct ID
  if (!creation) {
    creation = await prisma.creation.findUnique({
      where: { id: slugOrId },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        images: true,
        price: true,
        stock: true,
        categories: true,
      },
    });
  }

  if (!creation) {
    return {
      title: "Création introuvable | Crea'Soka",
      description: "Cette création n'existe pas ou n'est plus disponible.",
    };
  }

  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://creasoka.com"}/creations/${slugify(creation.title)}-${creation.id}`;
  const imageUrl = creation.image || `${process.env.NEXT_PUBLIC_APP_URL || "https://creasoka.com"}/placeholder.svg`;
  
  // Generate rich description
  const categoryText = creation.categories && creation.categories.length > 0
    ? creation.categories.join(", ")
    : "artisanat";
  
  const availabilityText = creation.stock > 0 ? "En stock" : "Rupture de stock";
  const metaDescription = `${creation.description.substring(0, 140)}... - ${creation.price}€ - ${availabilityText} - Catégories: ${categoryText}`;

  return {
    title: `${creation.title} | Crea'Soka`,
    description: metaDescription,
    keywords: [
      creation.title,
      ...(creation.categories || []),
      "création artisanale",
      "fait main",
      "unique",
    ],
    openGraph: {
      title: `${creation.title} - ${creation.price}€`,
      description: creation.description,
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: creation.title,
        },
        ...(creation.images || []).slice(0, 3).map((img) => ({
          url: img,
          width: 800,
          height: 800,
          alt: creation.title,
        })),
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${creation.title} - ${creation.price}€`,
      description: creation.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function CreationDetailPage({ params }: PageProps) {
  // Server component wrapper - metadata generated above
  // Render client component for interactivity
  return <CreationDetailClient />;
}
