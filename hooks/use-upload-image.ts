import { useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadResult {
  filePath: string | null;
  error: string | null;
}

export function useUploadImage() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult>({
    filePath: null,
    error: null,
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    // Réinitialiser l'état
    setStatus("uploading");
    setProgress(0);
    setResult({ filePath: null, error: null });

    // Vérification du type de fichier côté client
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setStatus("error");
      setResult({
        filePath: null,
        error:
          "Type de fichier non autorisé. Seuls les formats JPEG, PNG, WebP et GIF sont acceptés.",
      });
      return null;
    }

    // Vérification de la taille côté client (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setStatus("error");
      setResult({
        filePath: null,
        error: "Le fichier est trop volumineux. La taille maximale est de 5MB.",
      });
      return null;
    }

    // Simuler une progression
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prevProgress + 5;
      });
    }, 100);

    try {
      // Créer un objet FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append("file", file);

      // Envoyer le fichier à l'API
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        let errorMessage = "Erreur lors du téléchargement";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // Si la réponse n'est pas du JSON valide, utiliser le status text ou un message générique
          console.error("Erreur de parsing JSON:", parseError);
          errorMessage = `Erreur serveur: ${response.status} ${
            response.statusText || ""
          }`;
        }

        setStatus("error");
        setProgress(0);
        setResult({
          filePath: null,
          error: errorMessage,
        });
        return null;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error(
          "Erreur de parsing JSON pour la réponse réussie:",
          parseError
        );
        setStatus("error");
        setProgress(0);
        setResult({
          filePath: null,
          error: "Erreur lors du traitement de la réponse du serveur",
        });
        return null;
      }

      setStatus("success");
      setProgress(100);
      setResult({
        filePath: data.filePath,
        error: null,
      });

      return data.filePath;
    } catch (error) {
      clearInterval(progressInterval);
      setStatus("error");
      setProgress(0);
      setResult({
        filePath: null,
        error: "Erreur lors du téléchargement",
      });
      console.error("Erreur lors du téléchargement:", error);
      return null;
    }
  };

  return {
    uploadImage,
    status,
    progress,
    filePath: result.filePath,
    error: result.error,
    isUploading: status === "uploading",
    isSuccess: status === "success",
    isError: status === "error",
    reset: () => {
      setStatus("idle");
      setProgress(0);
      setResult({ filePath: null, error: null });
    },
  };
}
