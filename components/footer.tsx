import Link from "next/link"
import { Instagram, Facebook, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-creasoka mb-4">Crea'Soka</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Des créations artisanales uniques et pleines de charme pour ajouter une touche de magie à votre quotidien.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-creasoka mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-creasoka dark:hover:text-creasoka"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/galerie"
                  className="text-gray-600 dark:text-gray-400 hover:text-creasoka dark:hover:text-creasoka"
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-creasoka dark:hover:text-creasoka"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-creasoka mb-4">Restez connecté</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-creasoka dark:hover:text-creasoka">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-creasoka dark:hover:text-creasoka">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="mailto:contact@creasoka.com"
                className="text-gray-600 dark:text-gray-400 hover:text-creasoka dark:hover:text-creasoka"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Pour toute question ou commande personnalisée, n'hésitez pas à me contacter.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Crea'Soka. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/mentions-legales" className="hover:text-creasoka">
              Mentions légales
            </Link>
            <span>•</span>
            <Link href="/politique-de-cookies" className="hover:text-creasoka">
              Politique de cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
