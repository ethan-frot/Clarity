/**
 * API Route NextAuth v5 (US-10)
 *
 * Route dynamique catch-all pour NextAuth.
 * Gère automatiquement tous les endpoints d'authentification :
 * - POST /api/auth/signin/credentials - Connexion
 * - POST /api/auth/signout - Déconnexion
 * - GET  /api/auth/session - Récupérer la session
 * - GET  /api/auth/providers - Liste des providers
 *
 * La logique métier est déléguée au SignInUseCase via auth.ts
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
