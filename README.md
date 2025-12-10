# 🧶 Creasoka

Plateforme moderne d'artisanat créatif pour présenter, vendre et gérer un portfolio de créations fait-main.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)

## 🚀 Fonctionnalités Clés

### 🎨 Expérience Client (Storefront)
- **Galerie Interactive** : Filtrage par catégories (Bijoux, Chibi, Halloween...), recherche avancée (prix, date).
- **Fiche Produit Riche** : Zoom image, détails techniques, produits similaires, et **données structurées (SEO)**.
- **Panier & Checkout** :
  - Gestion de panier persistante.
  - Tunnel de commande multi-étapes.
  - **Paiement PayPal Intégré** (Sandbox/Live).
- **Visibilité** : 
  - Prix publics pour tous les visiteurs.
  - Achat réservé aux membres connectés (Stratégie d'acquisition).

### 🛡️ Administration & Back-Office
- **Dashboard Sécurisé** : Gestion complète des créations (CRUD).
- **Gestion des Commandes** : Suivi des statuts (Payé, Expédié, Livré), détails clients.
- **Stocks en Temps Réel** : Décrémentation automatique lors des paiements PayPal.
- **Sécurité Avancée** :
  - **Authentification** : JWT HttpOnly, Protection CSRF, Rate Limiting (Fail-Closed).
  - **Upload Sécurisé** : Validation des Magic Bytes (Anti-malware).
  - **Hardening** : Content Security Policy (CSP), Webhook Signature Verification.

---

## 🛠️ Stack Technique

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, Framer Motion (Animations).
- **Backend / API**: Route Handlers Next.js, Zod (Validation), Jose (JWT).
- **Base de Données**: PostgreSQL (via Supabase), Prisma ORM.
- **Paiement**: PayPal API (REST SDK).
- **Emails**: Resend API.
- **DevOps**: ESLint, TypeScript Strict.

---

## 🔧 Installation & Démarrage

### Pré-requis
- Node.js 18+
- pnpm 8+
- Une instance PostgreSQL (Supabase recommandé)
- Comptes développeurs : PayPal, Resend.

### 1. Cloner et Installer
```bash
git clone https://github.com/votre-user/creasoka.git
cd creasoka
pnpm install
```

### 2. Configurer l'Environnement
Copiez le fichier d'exemple et remplissez vos secrets :
```bash
cp .env.example .env.local
```
*Remplissez `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_WEBHOOK_ID`, etc.*

### 3. Initialiser la Base de Données
```bash
npx prisma migrate dev
# Optionnel : Charger des données de test
# npx ts-node prisma/seed.ts
```

### 4. Lancer le Serveur
```bash
pnpm dev
```
Accédez à `http://localhost:3000`.

---

## 🔒 Sécurité

Ce projet implémente les **Best Practices OWASP** :
- **XSS** : Sanitization automatique (React + DomPurify).
- **CSRF** : Protection double (Cookie SameSite + Header Origin Check).
- **Injection SQL** : Prévention native via Prisma ORM.
- **Auth** : Tokens JWT signés, stockés en Cookies HttpOnly (inaccessibles au JS client).

---

## 📄 Licence
Projet privé. Tous droits réservés.
