# 🌐 Clarity

> **Un forum moderne Next.js construit avec Clean Architecture, Domain-Driven Design et Test-Driven Development**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.4-green?style=flat)](https://www.better-auth.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 À propos du projet

**Clarity** est une refonte complète d'un projet d'école initial (`https://github.com/ThomasMouchelet/ESD_B3DW_nextjs-forum`), reconstruit **de zéro** pour appliquer les méthodologies d'architecture logicielle apprises en cours :

- ✅ **Clean Architecture** - Séparation stricte des responsabilités
- ✅ **Domain-Driven Design (DDD)** - Logique métier au centre
- ✅ **Test-Driven Development (TDD)** - Tests unitaires + E2E avec TestContainers

### 🎓 Contexte académique

Ce projet est un **exercice d'apprentissage** dans le cadre d'un cours de développement web fullstack. Les exigences de base du professeur (authentification, gestion utilisateurs, CRUD conversations/messages) ont été étendues avec une **touche personnelle** :

- Architecture modulaire inspirée de l'Hexagonal Architecture
- Tests automatisés avec base de données PostgreSQL réelle (TestContainers)
- Choix technique justifié : Better Auth vs NextAuth (voir [Décisions Architecturales](#-décisions-architecturales))
- Qualité code production-ready (Husky, lint-staged, ESLint, Prettier)

📋 **[Voir les critères d'évaluation du professeur →](./EVALUATION.md)**

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **pnpm** (recommandé) ou npm/yarn
- **Docker**
- **Git**

### 1. Cloner le repository

### 2. Installer les dépendances

```bash
pnpm install
# ou
npm install
```

### 3. Configuration environnement

Créer un fichier `.env.local` à la racine :

```bash
cp .env.example .env.local
```

**Modifier `.env.local` avec vos valeurs.**

### 4. Configuration base de données

```bash
# Démarrer PostgreSQL
docker compose up -d
```

### 5. Initialiser la base de données

```bash
# Appliquer le schéma Prisma
pnpm prisma db push

# Générer le client Prisma
pnpm prisma generate
```

### 6. Lancer le serveur de développement

```bash
pnpm dev
```

🎉 Ouvrir [http://localhost:3000](http://localhost:3000)

---

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité

- **Inscription / Connexion** - Email + mot de passe (hachage bcrypt 10 rounds)
- **Email verification** - Code OTP 6 chiffres envoyé par email
- **Réinitialisation mot de passe** - Lien sécurisé valable 10 minutes
- **Session persistante** - Cookies httpOnly + SameSite (30 jours)
- **Protection CSRF** - Tokens automatiques (Better Auth)
- **Validation forte** - Email valide + mot de passe complexe (8 chars, maj, min, chiffre, spécial)

### 💬 Forum

- **Conversations publiques** - Lisibles par tous (authentifiés ou non)
- **Création conversation** - Réservée aux utilisateurs connectés
- **Réponses aux conversations** - Messages dans conversations (auth requise)
- **Modification/Suppression** - Uniquement par propriétaire (ownership verification)
- **Soft delete** - Conversations/messages marqués `deletedAt` au lieu de supprimés

### 👤 Profil Utilisateur

- **Page profil publique** - `/users/[id]/contributions`
- **Contributions** - Liste conversations créées + messages postés
- **Statistiques** - Nombre total conversations/messages
- **Modification profil** - Avatar (upload Vercel Blob), bio, nom
- **Avatar customisable** - Upload + crop image

---

## 🏗️ Architecture

### Principes architecturaux

#### 1. Clean Architecture (Hexagonal)

```
┌─────────────────────────────────────────────────┐
│              UI Layer (React)                   │
│  ┌──────────────────────────────────────────┐   │
│  │  ConversationCreateForm.tsx              │   │
│  │  - Appelle Use Case                      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│          Application Layer (Use Cases)          │
│  ┌──────────────────────────────────────────┐   │
│  │  CreateConversationUseCase               │   │
│  │  - Logique métier (validation, règles)   │   │
│  │  - Indépendant de l'infrastructure       │   │
│  └──────────────────┬───────────────────────┘   │
└─────────────────────┼───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│          Domain Layer (Entities)                │
│  ┌──────────────────────────────────────────┐   │
│  │  Conversation.ts (entité pure)           │   │
│  │  - Logique métier domaine                │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│      Infrastructure Layer (Repositories)        │
│  ┌──────────────────────────────────────────┐   │
│  │  CreateConversationPrismaRepository      │   │
│  │  - Implémente Repository interface       │   │
│  │  - Détails technique Prisma              │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Avantages** :

- ✅ Logique métier testable sans dépendances externes
- ✅ Changement d'ORM facile (interface Repository)
- ✅ Séparation claire UI / Métier / Infrastructure

#### 2. Domain-Driven Design

**Bounded Contexts** :

- `module/conversation` - Contexte "Conversations"
- `module/message` - Contexte "Messages"
- `module/user` - Contexte "Utilisateurs"

**Use Cases** (Application Services) :

- Chaque action métier = 1 use case (SRP)
- Ex: `CreateConversationUseCase`, `UpdateMessageUseCase`

**Repositories** :

- Abstraction accès données (interface + implémentation)
- Ex: `ConversationRepository` → `ConversationPrismaRepository`

**Entities** :

- Modèles métier purs (domain/\*)
- Séparés des modèles Prisma (infrastructure)

#### 3. Test-Driven Development

**Tests unitaires** :

- Use cases testés avec repositories mockés
- Validation logique métier sans BDD
- Rapides (<100ms)

**Tests E2E** :

- PostgreSQL réel via TestContainers
- Tests API routes complètes
- Base de données isolée par test

---

## 🔧 Technologies

### Core Stack

| Technologie    | Version | Usage                                        |
| -------------- | ------- | -------------------------------------------- |
| **Next.js**    | 16.0    | Framework React fullstack (SSR + API Routes) |
| **TypeScript** | 5.9     | Typage statique                              |
| **React**      | 19.2    | Bibliothèque UI                              |
| **Prisma**     | 6.4     | ORM base de données                          |
| **PostgreSQL** | -       | Base de données relationnelle                |

### Authentification & Sécurité

| Technologie     | Usage                                                            |
| --------------- | ---------------------------------------------------------------- |
| **Better Auth** | Infrastructure auth complète (session, JWT, CSRF, rate limiting) |
| **bcryptjs**    | Hachage mots de passe (10 salt rounds)                           |
| **Resend**      | Envoi emails (password reset, email verification)                |

### UI/UX

| Technologie         | Usage                             |
| ------------------- | --------------------------------- |
| **Tailwind CSS**    | Framework CSS utility-first       |
| **shadcn/ui**       | Composants UI (built on Radix UI) |
| **Radix UI**        | Primitives UI accessibles         |
| **Lucide React**    | Icônes SVG                        |
| **Sonner**          | Toast notifications               |
| **React Hook Form** | Gestion formulaires               |
| **React Query**     | Gestion état serveur              |

### Testing

| Technologie        | Usage                           |
| ------------------ | ------------------------------- |
| **Jest**           | Test runner                     |
| **ts-jest**        | Support TypeScript dans Jest    |
| **TestContainers** | PostgreSQL isolé pour tests E2E |
| **Supertest**      | Tests API HTTP                  |

### Development Tools

| Outil           | Usage                             |
| --------------- | --------------------------------- |
| **Husky**       | Git hooks (pre-commit)            |
| **lint-staged** | Lint fichiers modifiés uniquement |
| **ESLint**      | Linter JavaScript/TypeScript      |
| **Prettier**    | Formateur code                    |

---

## 🧪 Tests

### Lancer tous les tests

```bash
pnpm test:ci
```

### Tests unitaires uniquement

```bash
pnpm test:unit
```

### Tests E2E uniquement

```bash
pnpm test:e2e
```

**Note** : Les tests E2E utilisent **TestContainers** pour lancer automatiquement un conteneur PostgreSQL isolé. Docker doit être installé et running.

## 🎯 Décisions Architecturales

### Pourquoi Better Auth plutôt que NextAuth ?

Better Auth gère toute l'infrastructure auth (validation, hachage, sessions, CSRF, rate limiting) → **-36 heures** de développement vs implémentation DDD pure, tout en maintenant la sécurité.

#### Comparaison Use Cases vs Better Auth

| Aspect            | DDD Pur (Use Cases)          | Better Auth Direct    |
| ----------------- | ---------------------------- | --------------------- |
| **Code backend**  | ~1300 lignes                 | ~130 lignes           |
| **Tests backend** | ~650 lignes                  | 0 (Better Auth testé) |
| **Temps dev**     | ~40 heures                   | ~4 heures             |
| **Maintenance**   | Élevée (updates manuelles)   | Faible (pnpm update)  |
| **Sécurité**      | Risque erreurs (fait maison) | Auditée + communauté  |

#### Principe appliqué : Infrastructure vs Logique Métier

**Better Auth gère** (infrastructure pure) :

- ❌ Valider email → Better Auth
- ❌ Hacher password → Better Auth
- ❌ Gérer sessions JWT → Better Auth
- ❌ Envoyer reset password → Better Auth

**Use Cases conservés** (logique métier forum) :

- ✅ `getUserContributions` → Compter conversations/messages + filtrer soft delete
- ✅ `createConversation` → Créer conversation + premier message atomiquement
- ✅ `deleteConversation` → Vérifier ownership + soft delete

**Règle d'or** : Créer un Use Case **uniquement si logique métier complexe spécifique au domaine**.

## 🤝 Contribution

Ce projet est un exercice académique personnel. Les contributions ne sont pas acceptées, mais les retours et suggestions sont les bienvenus !

## 📝 Licence

Ce projet est un projet académique. Tous droits réservés.

---

## 🎓 Apprentissages clés

### 1. Clean Architecture fonctionne (mais avec pragmatisme)

- ✅ Use Cases testables = excellent pour logique métier complexe
- ⚠️ Ne pas créer d'abstraction si pas de valeur ajoutée (YAGNI)
- ✅ Infrastructure auth (Better Auth) ≠ logique métier → déléguer

### 2. TDD change la qualité du code

- ✅ Tests d'abord → design API plus propre
- ✅ TestContainers → confiance tests E2E (BDD réelle)
- ✅ Tests = documentation vivante du comportement

### 3. Architecture modulaire = maintenabilité

- ✅ Modules indépendants (conversation, message, user)
- ✅ Changement d'une feature n'impacte pas les autres
- ✅ Onboarding nouveaux devs facilité

---

## 🙏 Remerciement

- **[Thomas Mouchelet](https://github.com/ThomasMouchelet)** - Cahier des charges et critères d'évaluation

- **[David Robert](https://github.com/davidroberto)** - Concept de Clean Architecture et DDD

---

**Développé avec ❤️ et rigueur architecturale**
