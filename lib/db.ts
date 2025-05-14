import { PrismaClient } from "./generated/prisma";

// PrismaClient est attaché au global object en développement pour éviter
// des instances multiples lors des hot reloads de Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fonction pour créer une instance PrismaClient avec des options pour éviter les connexions multiples
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Désactiver l'analyse syntaxique explicite pour éviter les erreurs de "prepared statement already exists"
    // Cette option est utile en développement avec Supabase/PostgreSQL
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Créer ou réutiliser le singleton
export const db = globalForPrisma.prisma || prismaClientSingleton();

// En développement, on attache l'instance au global pour réutilisation
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Export par défaut pour compatibilité supplémentaire
export default db;
