import { prisma } from '@/lib/prisma';
import { SignInRepository } from './SignInRepository';
import { User } from '@/domain/user/User';
import { PrismaClient } from '@/generated/prisma';

/**
 * Adapter Prisma pour SignInRepository
 *
 * Implémente l'interface du repository en utilisant Prisma Client.
 * Convertit les modèles Prisma en entités du domaine.
 *
 * Injection de dépendance :
 * - Accepte un PrismaClient optionnel via le constructeur
 * - Utilise le singleton par défaut si aucun client n'est fourni
 * - Permet l'utilisation d'un client de test pour les tests E2E
 */
export class SignInPrismaRepository implements SignInRepository {
  private prismaClient: PrismaClient;

  /**
   * Constructeur avec injection de dépendance
   *
   * @param prismaClient - Instance PrismaClient optionnelle (utilise le singleton par défaut)
   */
  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  /**
   * Recherche un utilisateur par son adresse email
   *
   * @param email - L'adresse email à rechercher
   * @returns L'entité User du domaine si trouvée, null sinon
   */
  async findByEmail(email: string): Promise<User | null> {
    // Requête en base de données avec Prisma
    const userData = await this.prismaClient.user.findUnique({
      where: { email },
    });

    // Utilisateur non trouvé
    if (!userData) {
      return null;
    }

    // Conversion du modèle Prisma vers l'entité du domaine
    // Note : Le mot de passe est déjà haché (format bcrypt)
    // L'entité User détectera le format bcrypt et ne validera pas
    return new User({
      id: userData.id,
      email: userData.email,
      password: userData.password,
      name: userData.name ?? undefined,
    });
  }
}
