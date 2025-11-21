import { User } from '@/domain/user/User';

/**
 * Interface du repository pour le use case SignIn
 *
 * Cette interface suit le principe d'inversion de dépendance :
 * - Le use case dépend de cette interface (port), pas d'une implémentation concrète
 * - Le repository Prisma (adapter) implémentera cette interface
 */
export interface SignInRepository {
  /**
   * Recherche un utilisateur par son adresse email
   *
   * @param email - L'adresse email à rechercher
   * @returns L'entité User si trouvée, null sinon
   */
  findByEmail(email: string): Promise<User | null>;
}
