# TODO - Code Review Creasoka

> **Généré le:** 23 Novembre 2025
> **Total des corrections:** 150+ problèmes identifiés
> **Temps estimé:** 13-17 heures

---

## Table des Matières

1. [Critiques - Sécurité](#-critiques---sécurité)
2. [Majeurs - Architecture](#-majeurs---architecture)
3. [Majeurs - Performance](#-majeurs---performance)
4. [Majeurs - Gestion des Erreurs](#-majeurs---gestion-des-erreurs)
5. [Majeurs - TypeScript](#-majeurs---typescript)
6. [Mineurs - Nettoyage](#-mineurs---nettoyage)
7. [Mineurs - Accessibilité](#-mineurs---accessibilité)
8. [Bonus - Tests](#-bonus---tests)
9. [Fichiers à Créer](#-fichiers-à-créer)
10. [Résumé par Fichier](#-résumé-par-fichier)

---

## 🔴 CRITIQUES - Sécurité

### 1. Middleware - Authentification basée sur Referer (DANGEREUX)

**Fichier:** `middleware.ts`
**Lignes:** 16-22
**Sévérité:** 🔴 CRITIQUE

**Problème:**
```typescript
// DANGEREUX - Le header referer peut être falsifié
const referer = request.headers.get("referer");
if (referer && referer.includes("/admin")) {
  return NextResponse.next();
}
```

**Attaque possible:**
```bash
curl -H "Referer: http://localhost:3000/admin" \
     http://localhost:3000/api/creations -X DELETE
```

**Correction requise:**
- [ ] Supprimer toute logique basée sur `referer`
- [ ] Implémenter vraie vérification JWT avec `jose` ou `jsonwebtoken`
- [ ] Vérifier le rôle admin dans le payload du token
- [ ] Ajouter validation de l'expiration du token

**Code suggéré:**
```typescript
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
}
```

---

### 2. XSS via dangerouslySetInnerHTML

**Fichier:** `lib/utils.ts`
**Lignes:** 40-70 (fonction `processMarkdownToHtml`)
**Sévérité:** 🔴 CRITIQUE

**Problème:**
```typescript
// La fonction convertit le markdown en HTML sans aucune sanitization
export function processMarkdownToHtml(markdown: string): string {
  let html = markdown;
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // ... Aucune protection contre les scripts malveillants
  return html;
}
```

**Attaque possible:**
```
Description: **Test<script>alert('xss')</script>**
```

**Correction requise:**
- [ ] Installer DOMPurify: `npm install dompurify @types/dompurify`
- [ ] Wrapper le résultat avec sanitization

**Code suggéré:**
```typescript
import DOMPurify from 'dompurify';

export function processMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Conversions markdown
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/\n/g, "<br>");

  // IMPORTANT: Sanitization pour éviter XSS
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'br', 'p', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}
```

**Fichiers utilisant cette fonction (à vérifier après correction):**
- `app/creations/[id]/page.tsx:253`

---

### 3. Validation API Manquante - Creations

**Fichier:** `app/api/creations/route.ts`
**Lignes:** 8-48
**Sévérité:** 🔴 CRITIQUE

**Problème:**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validation basique seulement
  if (!body.title || !body.description || !body.categories?.length) {
    return NextResponse.json({ error: "..." }, { status: 400 });
  }

  // MANQUE: Validation de:
  // - body.price (peut être négatif!)
  // - body.stock (peut être négatif!)
  // - body.categories (format valide?)
  // - body.image (URL valide?)
  // - body.externalLink (URL valide?)
```

**Correction requise:**
- [ ] Installer zod si pas déjà fait: `npm install zod`
- [ ] Créer un schema de validation complet
- [ ] Valider toutes les entrées utilisateur

**Code suggéré:**
```typescript
import { z } from 'zod';

const creationSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200),
  description: z.string().min(1, "Description requise"),
  categories: z.array(z.enum(["bijoux", "minis", "chibi", "halloween", "pokemon", "divers"]))
    .min(1, "Au moins une catégorie requise"),
  image: z.string().url("URL d'image invalide").optional(),
  images: z.array(z.string().url()).optional(),
  details: z.array(z.string()).optional(),
  status: z.enum(["nouveau", "vedette", "normal", "adopté", "promotion", "précommande"]).default("normal"),
  externalLink: z.string().url("URL externe invalide").optional().or(z.literal("")),
  customMessage: z.string().max(500).optional(),
  price: z.number().min(0, "Le prix ne peut pas être négatif"),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = creationSchema.parse(body);

    // Utiliser validatedData...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

---

### 4. Validation API Manquante - Orders

**Fichier:** `app/api/orders/route.ts`
**Sévérité:** 🔴 CRITIQUE

**Correction requise:**
- [ ] Ajouter validation Zod pour tous les champs
- [ ] Valider l'adresse de livraison
- [ ] Valider les items de commande
- [ ] Vérifier le stock disponible avant création

**Code suggéré:**
```typescript
const orderSchema = z.object({
  items: z.array(z.object({
    creationId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, "Au moins un article requis"),
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(5),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide"),
    country: z.string().min(1),
  }),
});
```

---

### 5. JWT Secret Non Obligatoire en Production

**Fichier:** `lib/auth.ts`
**Lignes:** 6-22
**Sévérité:** 🔴 CRITIQUE

**Problème:**
```typescript
if (!process.env.JWT_SECRET) {
  console.error("ERREUR CRITIQUE: JWT_SECRET n'est pas défini...")
  // throw new Error("...") - COMMENTÉ! Pas de fail-fast
}
```

**Correction requise:**
- [ ] Décommenter le throw pour forcer l'arrêt si JWT_SECRET manque

**Code suggéré:**
```typescript
if (!process.env.JWT_SECRET) {
  throw new Error(
    "ERREUR CRITIQUE: JWT_SECRET n'est pas défini. " +
    "Définissez cette variable dans .env.local"
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
```

---

### 6. Validation Email Faible

**Fichier:** `app/api/auth/forgot-password/route.ts`
**Lignes:** 18-24
**Sévérité:** 🟡 MINEUR

**Problème:**
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepte des emails invalides comme "a@b.c"
```

**Correction requise:**
- [ ] Utiliser validation Zod

**Code suggéré:**
```typescript
import { z } from 'zod';

const emailSchema = z.string().email("Email invalide");

try {
  const validEmail = emailSchema.parse(email);
} catch {
  return NextResponse.json({ error: "Email invalide" }, { status: 400 });
}
```

---

## 🟠 MAJEURS - Architecture

### 7. Créer Fichier de Constantes Centralisé

**Action:** Créer nouveau fichier
**Chemin:** `lib/constants.ts`

**Contenu suggéré:**
```typescript
// ===== CATÉGORIES =====
export const CATEGORIES = [
  "bijoux",
  "minis",
  "chibi",
  "halloween",
  "pokemon",
  "divers"
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  bijoux: "Bijoux",
  minis: "Minis",
  chibi: "Chibi",
  halloween: "Halloween",
  pokemon: "Pokémon",
  divers: "Divers",
};

// ===== STATUTS =====
export const STATUSES = [
  "nouveau",
  "vedette",
  "normal",
  "adopté",
  "promotion",
  "précommande"
] as const;

export type Status = typeof STATUSES[number];

export const STATUS_LABELS: Record<Status, string> = {
  nouveau: "Nouveau",
  vedette: "En vedette",
  normal: "Normal",
  adopté: "Adopté",
  promotion: "Promo",
  précommande: "Précommande",
};

// ===== AUTHENTIFICATION =====
export const AUTH = {
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MS: 15 * 60 * 1000, // 15 minutes
  JWT_EXPIRES_IN: "7d",
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 jours en secondes
} as const;

// ===== CACHE =====
export const CACHE = {
  TTL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ===== PAGINATION =====
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
} as const;
```

**Fichiers à mettre à jour après création:**
- [ ] `app/creations/[id]/page.tsx:163-165` → Utiliser `CATEGORY_LABELS`
- [ ] `app/categories/[category]/page.tsx:61-68` → Utiliser `CATEGORY_LABELS`
- [ ] `components/admin/creation-form.tsx:207-210` → Utiliser `CATEGORIES`
- [ ] `lib/cache.ts:2` → Utiliser `CACHE.TTL_MS`
- [ ] `lib/auth.ts:115, 229` → Utiliser `AUTH.*`

---

### 8. Créer Composant StatusBadge Réutilisable

**Action:** Créer nouveau fichier
**Chemin:** `components/status-badge.tsx`

**Contenu suggéré:**
```typescript
import { Badge } from "@/components/ui/badge";
import { Status, STATUS_LABELS } from "@/lib/constants";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg py-1 px-3"
};

const statusStyles: Record<Status, string> = {
  nouveau: "bg-green-500 text-white",
  vedette: "bg-creasoka text-white",
  normal: "bg-gray-500 text-white",
  adopté: "bg-red-500 text-white",
  promotion: "bg-pink-500 text-white",
  précommande: "bg-blue-500 text-white",
};

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  if (status === "normal") return null;

  return (
    <Badge className={`${statusStyles[status]} ${sizeClasses[size]} ${className}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export default StatusBadge;
```

**Fichiers à mettre à jour après création:**
- [ ] `components/creation-card.tsx:25-40` → Remplacer par `<StatusBadge />`
- [ ] `app/creations/[id]/page.tsx:221-230` → Remplacer par `<StatusBadge />`
- [ ] `app/creations/[id]/page.tsx:370-372` → Remplacer par `<StatusBadge />`

---

### 9. Créer Type Category Global

**Action:** Créer nouveau fichier
**Chemin:** `types/category.ts`

**Contenu suggéré:**
```typescript
export { Category, CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
```

**Fichiers à mettre à jour (supprimer définitions locales):**
- [ ] `app/categories/[category]/page.tsx:14` → Supprimer `type CategoryType`
- [ ] `components/admin/creation-form.tsx:21` → Supprimer `type CategoryType`
- [ ] Importer depuis `@/types/category` ou `@/lib/constants`

---

### 10. Supprimer Import Non Utilisé

**Fichier:** `app/creations/[id]/page.tsx`
**Ligne:** 8

**Vérification requise:**
- [ ] Vérifier si `ArrowRight` est utilisé (ligne 409 - OUI, utilisé)
- [ ] ✅ L'import est utilisé, pas besoin de supprimer

---

## 🟠 MAJEURS - Performance

### 11. Ajouter Memoization aux Composants

**Fichier:** `components/creation-card.tsx`
**Sévérité:** 🟠 MAJEUR

**Correction requise:**
- [ ] Wrapper le composant avec `React.memo()`

**Code suggéré:**
```typescript
import React from 'react';

function CreationCard({ creation }: CreationCardProps) {
  // ... contenu du composant
}

export default React.memo(CreationCard);
```

---

### 12. Ajouter useCallback pour les Handlers

**Fichier:** `components/header.tsx`
**Lignes:** 34-36
**Sévérité:** 🟠 MAJEUR

**Problème:**
```typescript
useClickOutside(dropdownRef, () => {
  setIsDropdownOpen(false);
}); // Nouvelle fonction créée à chaque render
```

**Correction requise:**
- [ ] Wrapper avec useCallback

**Code suggéré:**
```typescript
import { useCallback } from 'react';

const closeDropdown = useCallback(() => {
  setIsDropdownOpen(false);
}, []);

useClickOutside(dropdownRef, closeDropdown);
```

---

### 13. Optimiser Appels API - Featured Creations

**Fichier:** `components/featured-creations.tsx`
**Ligne:** 47
**Sévérité:** 🟠 MAJEUR

**Problème:**
```typescript
// Charge TOUTES les créations puis filtre
const response = await fetch("/api/creations");
const data = await response.json();
const vedettes = data.filter(c => c.status === "vedette");
```

**Correction requise:**
- [ ] Créer endpoint avec filtre: `/api/creations?status=vedette`
- [ ] Mettre à jour le fetch

**Modification API (`app/api/creations/route.ts`):**
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  const where: any = {};
  if (status) where.status = status;
  if (category) where.categories = { has: category };

  const creations = await prisma.creation.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(creations);
}
```

---

### 14. Ajouter Mise en Cache Après Fetch

**Fichier:** `app/creations/[id]/page.tsx`
**Lignes:** 45-52
**Sévérité:** 🟠 MAJEUR

**Problème:**
```typescript
const cachedData = getFromCache<Creation[]>("allCreations");
if (cachedData) {
  setAllCreations(cachedData);
} else {
  const response = await fetch(`/api/creations`);
  const data = await response.json();
  setAllCreations(data);
  // MANQUE: setToCache("allCreations", data);
}
```

**Correction requise:**
- [ ] Ajouter mise en cache après fetch

**Code suggéré:**
```typescript
import { setToCache } from "@/lib/clientCache";

// Après le fetch réussi
const data = await response.json();
setAllCreations(data);
setToCache("allCreations", data); // Ajouter cette ligne
```

---

## 🟠 MAJEURS - Gestion des Erreurs

### 15. Ne Pas Avaler les Erreurs Silencieusement

**Fichier:** `app/creations/[id]/page.tsx`
**Lignes:** 55-57
**Sévérité:** 🟠 MAJEUR

**Problème:**
```typescript
} catch {
  // Ignorer silencieusement - MAUVAIS!
}
```

**Correction requise:**
- [ ] Au minimum logger l'erreur

**Code suggéré:**
```typescript
} catch (error) {
  console.error("Erreur lors du chargement des créations:", error);
  // Optionnel: afficher un message à l'utilisateur
}
```

---

### 16. Distinguer Erreur Réseau vs 404

**Fichier:** `app/creations/[id]/page.tsx`
**Lignes:** 104-105
**Sévérité:** 🟠 MAJEUR

**Problème:**
```typescript
} catch {
  notFound(); // Toute erreur = 404, même erreur réseau
}
```

**Correction requise:**
- [ ] Distinguer les types d'erreurs

**Code suggéré:**
```typescript
} catch (error) {
  console.error("Erreur fetch création:", error);

  // Erreur réseau
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Afficher message d'erreur réseau
    setError("Erreur de connexion au serveur");
    return;
  }

  // Autre erreur = probablement 404
  notFound();
}
```

---

### 17. Messages d'Erreur Plus Informatifs

**Fichier:** `app/api/contact/route.ts`
**Lignes:** 40-45
**Sévérité:** 🟡 MINEUR

**Problème:**
```typescript
return NextResponse.json(
  { error: "Une erreur est survenue lors de l'envoi du message" },
  { status: 500 }
);
// Le client n'apprend rien sur la nature de l'erreur
```

**Correction requise:**
- [ ] Ajouter des messages plus spécifiques (sans exposer d'info sensible)

**Code suggéré:**
```typescript
} catch (error) {
  console.error("Erreur contact:", error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Données du formulaire invalides" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Impossible d'envoyer le message. Veuillez réessayer plus tard." },
    { status: 500 }
  );
}
```

---

## 🟠 MAJEURS - TypeScript

### 18. Supprimer Cast Inutile

**Fichier:** `app/creations/[id]/page.tsx`
**Ligne:** 307
**Sévérité:** 🟡 MINEUR

**Problème:**
```typescript
disabled={creation.stock === 0 || (creation.status as string) === "adopté"}
// Cast `as string` inutile - creation.status est déjà string
```

**Correction requise:**
- [ ] Supprimer le cast

**Code suggéré:**
```typescript
disabled={creation.stock === 0 || creation.status === "adopté"}
```

---

## 🟡 MINEURS - Nettoyage

### 19. Supprimer Code Commenté - Email

**Fichier:** `lib/email.ts`
**Lignes:** 146-156
**Sévérité:** 🟡 MINEUR

**Problème:**
```typescript
// Décommenter et configurer pour la production avec Resend :
/*
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({...});
*/
```

**Correction requise:**
- [ ] Décider: activer Resend pour la production OU supprimer le code commenté
- [ ] Si activation, créer une condition basée sur `NODE_ENV`

**Code suggéré (si activation):**
```typescript
if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@creasoka.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return true;
}

// Fallback dev: log dans console
console.log(`📧 Email: ${options.to} - ${options.subject}`);
return true;
```

---

### 20. Nettoyer Commentaire Obsolète

**Fichier:** `app/admin/page.tsx`
**Lignes:** 47-48, 52-53
**Sévérité:** 🟡 MINEUR

**Problème:**
```typescript
{/* Logout button is handled in header/auth context usually, but added here to match screenshot if needed,
    though usually it's in the nav. The screenshot shows it in the header area. */}

{/* Stats Cards (Keeping them as they are useful, but maybe user wants them hidden?
    I'll keep them for now as "Phase 1" added them, but if user complains I'll remove) */}
```

**Correction requise:**
- [ ] Supprimer ces commentaires de développement
- [ ] Décider si le logout button doit être ici ou dans le header
- [ ] Décider si les stats cards restent

---

### 21. Uniformiser Magic Numbers

**Fichiers multiples:**

| Fichier | Ligne | Valeur | Remplacer par |
|---------|-------|--------|---------------|
| `lib/cache.ts` | 2 | `5 * 60 * 1000` | `CACHE.TTL_MS` |
| `lib/auth.ts` | 115 | `7 * 24 * 60 * 60` | `AUTH.COOKIE_MAX_AGE` |
| `lib/auth.ts` | 229 | `>= 5` | `AUTH.LOGIN_MAX_ATTEMPTS` |
| `lib/auth.ts` | 229 | `15 * 60 * 1000` | `AUTH.LOGIN_LOCKOUT_MS` |
| `app/creations/[id]/page.tsx` | 72 | `<= 20` | Commenter ou créer constante |

---

## 🟡 MINEURS - Accessibilité

### 22. Navigation Clavier Dropdown

**Fichier:** `components/header.tsx`
**Lignes:** 92-149
**Sévérité:** 🟠 MAJEUR

**Problèmes:**
- Pas de handler `onKeyDown` pour Escape
- Pas de navigation avec flèches
- Pas d'attribut `aria-expanded`

**Correction requise:**
- [ ] Ajouter `aria-expanded`
- [ ] Ajouter handler clavier

**Code suggéré:**
```typescript
<button
  className={...}
  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  }}
  aria-expanded={isDropdownOpen}
  aria-haspopup="true"
>
  {item.label}
  <ChevronDown className={...} aria-hidden="true" />
</button>
```

---

### 23. Améliorer Contraste Texte

**Fichiers multiples:**
**Sévérité:** 🟡 MINEUR

**Corrections requises:**
- [ ] Remplacer `text-gray-600` par `text-gray-700` sur fond clair
- [ ] Remplacer `text-gray-300` par `text-gray-200` en dark mode
- [ ] Vérifier avec un outil de contraste (minimum 4.5:1 pour AA)

**Fichiers à vérifier:**
- `app/page.tsx:188`
- `components/header.tsx:156`
- Tous les fichiers avec `text-gray-600` ou `text-gray-300`

---

## 🔵 BONUS - Tests

### 24. Setup Framework de Tests

**Action:** Configuration initiale

**Étapes:**
- [ ] Installer Vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Créer `vitest.config.ts`
- [ ] Créer dossier `__tests__/`
- [ ] Ajouter scripts dans `package.json`

**Fichier `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**Fichier `vitest.setup.ts`:**
```typescript
import '@testing-library/jest-dom';
```

**Ajouter dans `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

### 25. Tests Prioritaires à Écrire

**Tests critiques (par ordre de priorité):**

1. **`__tests__/lib/auth.test.ts`**
   - [ ] `hashPassword()` - Hash correctement
   - [ ] `verifyPassword()` - Vérifie correctement
   - [ ] `generateToken()` - Génère token valide
   - [ ] `verifyToken()` - Vérifie token valide
   - [ ] `verifyToken()` - Rejette token expiré
   - [ ] `recordLoginAttempt()` - Bloque après 5 tentatives

2. **`__tests__/lib/utils.test.ts`**
   - [ ] `slugify()` - Génère slug correct
   - [ ] `processMarkdownToHtml()` - Convertit markdown
   - [ ] `processMarkdownToHtml()` - Sanitize XSS (après correction)

3. **`__tests__/api/creations.test.ts`**
   - [ ] GET - Retourne liste créations
   - [ ] POST - Crée création valide
   - [ ] POST - Rejette données invalides
   - [ ] PUT - Met à jour création
   - [ ] DELETE - Supprime création

4. **`__tests__/middleware.test.ts`**
   - [ ] Protège routes admin
   - [ ] Rejette token invalide
   - [ ] Rejette utilisateur non-admin

---

## 📁 FICHIERS À CRÉER

| Fichier | Description | Priorité |
|---------|-------------|----------|
| `lib/constants.ts` | Constantes centralisées | 🟠 Haute |
| `components/status-badge.tsx` | Badge statut réutilisable | 🟠 Haute |
| `types/category.ts` | Export types catégories | 🟡 Moyenne |
| `vitest.config.ts` | Configuration tests | 🔵 Bonus |
| `vitest.setup.ts` | Setup tests | 🔵 Bonus |
| `__tests__/lib/auth.test.ts` | Tests auth | 🔵 Bonus |
| `__tests__/lib/utils.test.ts` | Tests utils | 🔵 Bonus |

---

## 📊 RÉSUMÉ PAR FICHIER

| Fichier | Corrections | Priorité | Temps Est. |
|---------|------------|----------|------------|
| `middleware.ts` | 3 | 🔴 CRITIQUE | 1h |
| `lib/utils.ts` | 1 | 🔴 CRITIQUE | 30min |
| `lib/auth.ts` | 3 | 🔴 CRITIQUE | 30min |
| `app/api/creations/route.ts` | 5 | 🔴 CRITIQUE | 1h |
| `app/api/orders/route.ts` | 2 | 🔴 CRITIQUE | 30min |
| `app/api/auth/forgot-password/route.ts` | 1 | 🟡 MINEUR | 15min |
| `app/creations/[id]/page.tsx` | 5 | 🟠 MAJEUR | 1h |
| `components/header.tsx` | 3 | 🟠 MAJEUR | 45min |
| `components/creation-card.tsx` | 2 | 🟠 MAJEUR | 15min |
| `components/featured-creations.tsx` | 1 | 🟠 MAJEUR | 30min |
| `lib/email.ts` | 1 | 🟡 MINEUR | 15min |
| `app/admin/page.tsx` | 2 | 🟡 MINEUR | 10min |
| `lib/cache.ts` | 1 | 🟡 MINEUR | 5min |

---

## ⏱️ ESTIMATION TOTALE

| Phase | Temps |
|-------|-------|
| 🔴 Critique (Sécurité) | 3-4h |
| 🟠 Majeur (Architecture) | 3-4h |
| 🟠 Majeur (Performance) | 1-2h |
| 🟠 Majeur (Erreurs) | 1h |
| 🟡 Mineur (Nettoyage) | 1h |
| 🟡 Mineur (Accessibilité) | 1h |
| 🔵 Tests (Bonus) | 3-4h |
| **TOTAL** | **13-17h** |

---

## 📝 NOTES IMPORTANTES

1. **Ordre recommandé:** Commencer par les corrections 🔴 CRITIQUES (sécurité), car elles peuvent exposer l'application à des attaques.

2. **Tests:** Idéalement, écrire les tests AVANT de corriger pour s'assurer que les corrections fonctionnent.

3. **Backup:** Faire un commit avant chaque phase de corrections pour pouvoir revenir en arrière si nécessaire.

4. **Revue:** Après les corrections critiques, faire une revue de sécurité complète avec un outil comme `npm audit`.

---

> **Créé par:** Claude Code Review
> **Pour:** Projet Creasoka
> **Version:** 1.0
