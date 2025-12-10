import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Récupérer toutes les créations depuis la base de données
  const creations = await prisma.creation.findMany({
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  // URL de base du site
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://creasoka.com";

  // Pages statiques avec leur date de dernière modification
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/galerie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-de-cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Pages de catégories
  const categories = ["bijoux", "minis", "halloween", "pokemon", "divers"];

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Pages de créations
  const creationPages = creations.map(
    (creation: { id: string; title: string; updatedAt: string | Date }) => {
      // Transformer l'ID pour qu'il contienne le titre slugifié comme dans l'URL
      const titleSlug = creation.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");

      // Vérifier si l'ID contient déjà le slug ou s'il s'agit d'un ancien format d'ID
      const slug = creation.id.includes(titleSlug)
        ? creation.id
        : `${titleSlug}-${creation.id}`;

      return {
        url: `${baseUrl}/creations/${slug}`,
        lastModified: creation.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    }
  );

  // Combiner toutes les pages pour le sitemap
  return [...staticPages, ...categoryPages, ...creationPages];
}
