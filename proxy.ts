import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Liste blanche des origines autorisées pour CORS
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://www.paypal.com',
  'https://www.sandbox.paypal.com',
];

// Middleware protégeant les routes admin et API sensibles
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // 0. GESTION CORS POUR LES ROUTES API
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      if (origin && allowedOrigins.includes(origin)) {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
      return new NextResponse(null, { status: 403 });
    }
  }

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

  // Ajouter les headers CORS aux réponses API si l'origine est autorisée
  const response = NextResponse.next();
  if (pathname.startsWith('/api/') && origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

// Configuration des chemins sur lesquels le middleware s'exécute
export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
