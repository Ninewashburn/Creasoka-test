// Utiliser l'instance prisma depuis notre fichier prisma.js
import prisma from "./prisma";

// Exporter l'instance pour compatibilité
export const db = prisma;

// Export par défaut pour compatibilité supplémentaire
export default db;
