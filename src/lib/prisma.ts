/**
 * Singleton Prisma Client
 *
 * Évite l'épuisement de connexions lors du hot-reload Next.js en dev
 */
import { PrismaClient } from '../generated/prisma';

export const prisma = new PrismaClient();
