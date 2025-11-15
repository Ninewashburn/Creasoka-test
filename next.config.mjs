/** @type {import('next').NextConfig} */
const nextConfig = {
  // Packages serveur externes pour compatibilité avec Prisma et librairies natives
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],

  // Configuration Webpack pour Prisma sur Vercel
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Déjà géré par serverExternalPackages
    }
    return config;
  },

  // Configuration des images Next.js
  images: {
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
