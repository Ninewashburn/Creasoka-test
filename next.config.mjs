/** @type {import('next').NextConfig} */
const nextConfig = {
  // Packages serveur externes pour compatibilité avec Prisma et librairies natives
  // serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],

  // Configuration Webpack pour Prisma sur Vercel
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // Déjà géré par serverExternalPackages
  //   }
  //   return config;
  // },

  // Configuration des images Next.js
  images: {
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com;"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
