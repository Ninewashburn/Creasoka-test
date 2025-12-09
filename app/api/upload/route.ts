import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { checkLoginAttempts, verifyAuth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * API pour télécharger des images vers le dossier public
 */
export async function POST(request: Request) {
  try {
    // Auth check
    try {
      const auth = await verifyAuth();
      if (auth.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

    const attemptCheck = await checkLoginAttempts(clientIp);
    if (!attemptCheck.allowed) {
      return NextResponse.json(
        { error: attemptCheck.message || "Trop de tentatives" },
        { status: 429 }
      );
    }

    // Pour gérer les données multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier trouvé dans la requête" },
        { status: 400 }
      );
    }

    // Vérification du type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non autorisé. Seuls les formats JPEG, PNG, WebP et GIF sont acceptés.",
        },
        { status: 400 }
      );
    }

    // Vérification de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "Le fichier est trop volumineux. La taille maximale est de 5MB.",
        },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique avec extension sûre basée sur le type MIME
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif"
    };

    const extension = mimeToExt[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Type de fichier non supporté." },
        { status: 400 }
      );
    }

    const fileName = `${uuidv4()}.${extension}`;

    // Définir le chemin où sauvegarder le fichier
    const directory = "images/creations";
    const publicDir = join(process.cwd(), "public", directory);

    // Convertir le fichier en tableau d'octets
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Écrire le fichier dans le dossier public
    const filePath = join(publicDir, fileName);
    await writeFile(filePath, buffer);

    // Renvoyer le chemin relatif du fichier pour stockage en base de données
    const imagePath = `/${directory}/${fileName}`;

    return NextResponse.json({
      success: true,
      filePath: imagePath,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
      { status: 500 }
    );
  }
}
