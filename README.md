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

- **Galerie de créations** : Affichage des créations avec système de filtrage par catégories
- **Administration sécurisée** : Interface pour gérer les créations
- **URLs optimisées** : Format d'URL incluant le titre slugifié pour un meilleur référencement
- **Système de sécurité complet** :
  - Protection des routes admin et API via middleware
  - Gestion des permissions basée sur les rôles (admin, user, guest)
  - Protection contre les attaques par force brute
  - Gestion sécurisée des tokens JWT
  - Protection CSRF
- **SEO optimisé** :
  - Métadonnées enrichies pour chaque page
  - Génération automatique du sitemap XML
  - Données structurées Schema.org
  - Tags OpenGraph et Twitter Cards
  - URLs optimisées avec slugs

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
├── app/                # Routes et pages Next.js
│   ├── api/            # Routes API
│   ├── admin/          # Interface d'administration
│   ├── sitemap.ts      # Générateur de sitemap XML
│   └── ...             # Autres pages
├── components/         # Composants React réutilisables
│   ├── seo/            # Composants pour le SEO
│   └── ...             # Autres composants
├── hooks/              # Custom React hooks
├── lib/                # Utilitaires et fonctions
│   ├── auth.ts         # Authentification et sécurité
│   ├── permissions.ts  # Système de permissions
│   └── prisma.js       # Configuration de Prisma
├── prisma/             # Configuration Prisma et migrations
│   └── schema.prisma   # Schéma de la base de données
├── public/             # Fichiers statiques
│   ├── robots.txt      # Configuration pour les robots
│   └── ...             # Autres fichiers statiques
└── styles/             # Feuilles de style
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
