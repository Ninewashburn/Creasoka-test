import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = global;

// PrismaClient est attaché au global object pour empêcher les connections multiples pendant le hot reloading
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [] // Désactivation des logs en développement
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
