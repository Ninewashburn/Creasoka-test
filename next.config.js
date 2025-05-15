/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],
  webpack: (config, { isServer }) => {
    // Ajout des binaires Prisma pour support sur Vercel
    if (isServer) {
      // config.externals.push("@prisma/client"); // Déjà géré par serverExternalPackages
    }
    return config;
  },
};

module.exports = nextConfig;
