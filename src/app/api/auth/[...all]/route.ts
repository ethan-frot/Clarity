/**
 * API Route : Better Auth Handler
 *
 * Handler principal pour toutes les routes d'authentification Better Auth.
 *
 * Routes disponibles :
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/get-session
 * - POST /api/auth/forget-password
 * - POST /api/auth/reset-password
 */
import { auth } from '@/lib/auth/better-auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Force Node.js runtime (Prisma n'est pas compatible avec Edge Runtime)
export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth);
