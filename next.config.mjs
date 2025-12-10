/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Packages serveur externes pour compatibilité avec Prisma et librairies natives
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "jsonwebtoken",
    // Exclure les packages d'instrumentation OpenTelemetry/Sentry
    "!import-in-the-middle",
    "!require-in-the-middle"
  ],

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
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80],
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
            // CSP plus permissif en dev pour hot reload et dev tools, strict en prod
            value: isDev
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com; connect-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com;"
              : "default-src 'self'; script-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com; connect-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com;"
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
