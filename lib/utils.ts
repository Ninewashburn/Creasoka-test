import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function findCreationBySlug(
  creations: any[],
  slug: string
): any | undefined {
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
