# Creasoka

Application web pour un site d'artisanat créatif permettant de présenter et gérer un portfolio de créations fait-main.

## 🚀 Technologies

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de données**: PostgreSQL (via Supabase)
- **Authentification**: JWT (JSON Web Tokens)
- **Hébergement**: Compatible avec Vercel
- **SEO**: Métadonnées optimisées, Sitemap XML, Schema.org, OpenGraph

## 📋 Fonctionnalités

- **Galerie Interactive** :
  - Affichage des créations avec filtrage par catégories
  - **Modale immersive** : Zoom sur les images, navigation fluide, et détails essentiels
  - **Section "Les Adoptés"** : Mise en valeur des créations vendues avec un style distinctif
- **Boutique & Panier** :
  - Gestion du panier d'achat
  - Processus de commande (Checkout)
  - **Gestion des stocks** : Désactivation automatique du bouton "Ajouter au panier" pour les articles adoptés
- **Administration** : Interface sécurisée pour gérer le portfolio et les stocks
- **URLs optimisées** : Slugs basés sur les titres pour un SEO performant
- **Sécurité** :
  - Protection des routes admin et API
  - Authentification JWT robuste
  - Rôles : Admin, User, Guest
- **SEO Technique** :
  - Métadonnées dynamiques et OpenGraph
  - Sitemap XML automatique
  - Données structurées (Schema.org)

## 🔧 Installation

```bash
# Installer les dépendances
npm install
# ou
pnpm install

# Configurer la base de données
npx prisma migrate dev

# Lancer le serveur de développement
npm run dev
# ou
pnpm dev
```

## 🔐 Configuration

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/creasoka"
DIRECT_URL="postgresql://user:password@localhost:5432/creasoka"

# Sécurité
JWT_SECRET="votre_clé_secrète_très_longue_et_complexe"
JWT_EXPIRES_IN="7d"
```

## 🏗 Structure du projet

```
creasoka/
├── app/                # App Router (Pages & API)
│   ├── admin/          # Dashboard administrateur
│   ├── api/            # Endpoints API (CRUD, Auth, Upload)
│   ├── galerie/        # Page Galerie avec filtrage
│   └── ...
├── components/         # Composants React
│   ├── ui/             # Composants UI réutilisables (Shadcn/ui)
│   ├── zoomable-image.tsx # Gestion de la modale image
│   └── ...
├── lib/                # Logique métier et utilitaires
│   ├── prisma.js       # Client Prisma (Singleton)
│   ├── utils.ts        # Fonctions utilitaires (cn, slugify...)
│   └── ...
├── prisma/             # Schéma DB et migrations
├── public/             # Assets statiques
└── ...
```

## 🔒 Système de permissions

L'application utilise un système de permissions basé sur les rôles :

- **Admin** : Accès complet à toutes les fonctionnalités
- **User** : Accès en lecture uniquement
- **Guest** : Accès limité aux pages publiques

## 🔍 SEO

Le projet utilise plusieurs techniques pour optimiser le référencement :

- **Métadonnées dynamiques** : Chaque page a ses propres métadonnées adaptées au contenu
- **Sitemap XML** : Généré automatiquement à partir des données de la base
- **Données structurées** : Utilisation de Schema.org pour améliorer la compréhension du contenu par les moteurs de recherche
- **OpenGraph et Twitter Cards** : Pour un meilleur affichage sur les réseaux sociaux
- **URLs optimisées** : Utilisation de slugs pour des URLs lisibles et pertinentes

## 🪲 Dépannage

### Erreur "prepared statement already exists"

Cette erreur PostgreSQL peut survenir en développement avec Supabase. Elle est causée par des connexions multiples à la base de données. Un pattern singleton pour PrismaClient a été implémenté pour minimiser ce problème.

Ces erreurs disparaissent généralement après un certain temps quand les connexions expirent ou lors d'un redémarrage du serveur de développement.

## 📝 Notes de développement

- Pour accéder au tableau de bord admin : `/admin`
- Pour ajouter une nouvelle création : `/admin/nouvelle-creation`

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.
