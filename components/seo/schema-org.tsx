import React from "react";
import Script from "next/script";

type SchemaOrgProps = {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  type?: "WebSite" | "Product" | "Article" | "Organization";
  productData?: {
    name: string;
    description: string;
    imageUrl: string;
    category?: string;
  };
};

export default function SchemaOrg({
  url,
  title,
  description,
  imageUrl,
  type = "WebSite",
  productData,
}: SchemaOrgProps) {
  // Schéma de base pour le site web
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
    url,
    name: title,
    description,
    ...(imageUrl && { image: imageUrl }),
  };

  // Schéma spécifique pour l'organisation
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    url: "https://creasoka.com",
    name: "Crea'Soka",
    description:
      "Créations artisanales uniques et pleines de charme pour ajouter une touche de magie à votre quotidien.",
    logo: "https://creasoka.com/logo.png",
    sameAs: [
      // Ajouter ici les liens vers les réseaux sociaux
      // Par exemple: 'https://instagram.com/creasoka'
    ],
  };

  // Schéma pour les produits (créations)
  const productSchema = productData
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productData.name,
        description: productData.description,
        image: productData.imageUrl,
        ...(productData.category && { category: productData.category }),
        brand: {
          "@type": "Brand",
          name: "Crea'Soka",
        },
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "EUR",
          url: url,
        },
      }
    : null;

  // Choisir le schéma approprié en fonction du type
  let schema: Record<string, unknown>;
  switch (type) {
    case "Organization":
      schema = organizationSchema;
      break;
    case "Product":
      schema = productSchema || baseSchema;
      break;
    default:
      schema = baseSchema;
  }

  return (
    <Script
      id="schema-org"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Exemple d'utilisation sur une page de création:
//
// <SchemaOrg
//   url={`https://creasoka.com/creations/${creation.id}`}
//   title={creation.title}
//   description={creation.description}
//   imageUrl={creation.image}
//   type="Product"
//   productData={{
//     name: creation.title,
//     description: creation.description,
//     imageUrl: creation.image,
//     category: creation.categories[0]
//   }}
// />
