import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Creation } from "@/types/creation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/œ/g, "oe") // Replace œ with oe
    .normalize("NFD") // Normalize to decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function findCreationBySlug(
  creations: Creation[],
  slug: string
): Creation | undefined {
  return creations.find((creation) => slugify(creation.title) === slug);
}

/**
 * Convertit le texte Markdown simple en HTML
 */
export function processMarkdownToHtml(text: string): string {
  if (!text) return "";

  let html = text;

  // Convertir les astérisques doubles en balises strong
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convertir les astérisques simples en balises em
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convertir les lignes commençant par "- " en items de liste
  html = html.replace(/^- (.*?)$/gm, "<li>$1</li>");

  // Entourer les balises li consécutives avec ul
  if (html.includes("<li>")) {
    // Cette regex capture les groupes de lignes contenant des <li>
    html = html.replace(/(?:(?:<li>.*?<\/li>\s*)+)/g, "<ul>$&</ul>");
  }

  // Convertir les sauts de ligne simples en <br> et les doubles en nouveaux paragraphes
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");

  // Envelopper le contenu dans des paragraphes si ce n'est pas déjà fait
  if (!html.startsWith("<p>") && !html.startsWith("<ul>")) {
    html = "<p>" + html + "</p>";
  }

  return html;
}
