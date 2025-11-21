import { User } from '@/domain/user/User';

/**
 * Repository interface for SignIn use case
 *
 * This interface follows the Dependency Inversion Principle:
 * - The use case depends on this interface (port), not on a concrete implementation
 * - The Prisma repository (adapter) will implement this interface
 */
export interface SignInRepository {
  /**
   * Find a user by email address
   *
   * @param email - The email address to search for
   * @returns The User entity if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;
}
