import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "./lib/auth";
import { Action, Resource, UserRole, hasPermission } from "./lib/permissions";

// Middleware protégeant les routes admin et API sensibles
export default function middleware(request: NextRequest) {
  // PROTECTION MINIMALISTE POUR LES ROUTES ADMIN
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Si c'est la page d'accueil admin, toujours autoriser (pour pouvoir s'y connecter)
    if (request.nextUrl.pathname === "/admin") {
      return NextResponse.next();
    }

    // Autoriser toutes les navigations entre pages admin si l'authentification est en place
    const referer = request.headers.get("referer");
    if (referer && referer.includes("/admin")) {
      return NextResponse.next();
    }

    // Si aucune des conditions n'est remplie, rediriger vers la page admin (pas la page d'accueil)
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // PROTECTION DES ROUTES API (simplifiée)
  if (
    request.nextUrl.pathname.startsWith("/api/creations") ||
    request.nextUrl.pathname.startsWith("/api/upload")
  ) {
    // Autoriser toutes les requêtes provenant de pages admin
    const referer = request.headers.get("referer");
    if (referer && referer.includes("/admin")) {
      return NextResponse.next();
    }

    // Autoriser toutes les lectures (GET) pour tous les utilisateurs
    if (request.method === "GET") {
      return NextResponse.next();
    }

    // Pour les autres méthodes (POST, PUT, DELETE), n'autoriser que si authentifié
    const token = getTokenFromRequest(request);
    if (token && verifyToken(token)) {
      return NextResponse.next();
    }

    // Sinon, refuser l'accès
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware s'exécute
export const config = {
  matcher: ["/admin/:path*", "/api/creations/:path*", "/api/upload/:path*"],
};
