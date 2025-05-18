import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = global;

// PrismaClient est attaché au global object pour empêcher les connections multiples pendant le hot reloading
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Ajouter cette configuration pour améliorer les performances
    connection: {
      // Augmenter le nombre maximum de connexions pour les requêtes importantes
      pool: {
        min: 2,
        max: 10,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
