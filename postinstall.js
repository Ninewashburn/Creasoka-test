const { execSync } = require("child_process");

// Script pour exécuter prisma generate après l'installation des dépendances
try {
  console.log("🔄 Exécution de prisma generate...");
  execSync("npx prisma generate");
  console.log("✅ Génération Prisma terminée avec succès");
} catch (error) {
  console.error("❌ Erreur lors de la génération Prisma:");
  console.error(error.message);
  process.exit(1);
}
