import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Proxy protégeant les routes admin et API sensibles (Next.js 16+)
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PROTECTION DES ROUTES ADMIN
  if (pathname.startsWith("/admin")) {
    // Page de login admin : toujours accessible
    if (pathname === "/admin") {
      return NextResponse.next();
    }

    // Vérification du token pour les autres pages admin
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Vérifier le rôle admin
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalide ou expiré
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 2. PROTECTION DES ROUTES API
  if (
    pathname.startsWith("/api/creations") ||
    pathname.startsWith("/api/upload")
  ) {
    // GET autorisé pour tout le monde (lecture publique)
    if (request.method === "GET") {
      return NextResponse.next();
    }

    // POST, PUT, DELETE nécessitent une authentification
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      if (payload.role !== "admin") {
        return NextResponse.json({ error: "Interdit" }, { status: 403 });
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware s'exécute
export const config = {
  matcher: ["/admin/:path*", "/api/creations/:path*", "/api/upload/:path*"],
};
