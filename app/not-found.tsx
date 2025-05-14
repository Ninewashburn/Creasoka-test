import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page non trouvée | Crea'Soka",
  description: "La page que vous recherchez n'existe pas",
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="max-w-xl mx-auto">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <Image
            src="/logo.png"
            alt="Crea'Soka Logo"
            width={160}
            height={160}
            className="opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-creasoka">404</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Page non trouvée
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oups ! La page que vous recherchez semble avoir été égarée dans notre
          atelier créatif.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="group">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour à la page précédente
            </Link>
          </Button>

          <Button asChild className="bg-creasoka hover:bg-creasoka/90">
            <Link href="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4">
            Vous pourriez être intéressé par :
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/galerie"
              className="py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Notre galerie
            </Link>
            <Link
              href="/categories/bijoux"
              className="py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Bijoux
            </Link>
            <Link
              href="/categories/minis"
              className="py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Figurines miniatures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
 