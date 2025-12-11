"use client";

import { useEffect } from "react";

interface DynamicHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

/**
 * Dynamic Head component for client-side metadata updates
 * Useful for client components that can't use generateMetadata()
 */
export default function DynamicHead({ title, description, image, url }: DynamicHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Crea'Soka`;

    // Update or create meta tags
    const updateOrCreateMeta = (property: string, content: string, isName = false) => {
      const attribute = isName ? "name" : "property";
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta
    updateOrCreateMeta("description", description, true);

    // Open Graph
    updateOrCreateMeta("og:title", title);
    updateOrCreateMeta("og:description", description);
    if (image) {
      updateOrCreateMeta("og:image", image);
    }
    if (url) {
      updateOrCreateMeta("og:url", url);
    }

    // Twitter
    updateOrCreateMeta("twitter:title", `${title} - Crea'Soka`, true);
    updateOrCreateMeta("twitter:description", description, true);
    if (image) {
      updateOrCreateMeta("twitter:image", image, true);
    }

    // Canonical link
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }
  }, [title, description, image, url]);

  return null; // This component doesn't render anything
}
