/**
 * Singleton Prisma Client
 *
 * Évite l'épuisement de connexions lors du hot-reload Next.js en dev
 * En environnement de test, recréé automatiquement le client si DATABASE_URL change
 */
import { PrismaClient } from '../generated/prisma';

let _prisma: PrismaClient | null = null;
let _lastDatabaseUrl: string | undefined = undefined;

function createPrismaClient(): PrismaClient {
  const currentDatabaseUrl = process.env.DATABASE_URL;

  // En tests E2E, recréer le client si DATABASE_URL a changé (testcontainers)
  if (process.env.NODE_ENV === 'test') {
    if (!_prisma || _lastDatabaseUrl !== currentDatabaseUrl) {
      if (_prisma) {
        _prisma.$disconnect();
      }
      _prisma = new PrismaClient();
      _lastDatabaseUrl = currentDatabaseUrl;
    }
    return _prisma;
  }

  // En production/dev, utiliser le singleton standard
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = createPrismaClient();
    return client[prop as keyof PrismaClient];
  },
});
