/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  webpack: (config, { isServer }) => {
    // Ajout des binaires Prisma pour support sur Vercel
    if (isServer) {
      config.externals.push("@prisma/client");
    }
    return config;
  },
};

module.exports = nextConfig;
