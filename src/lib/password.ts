/**
 * Utilitaires bcrypt - Hachage et vérification de mots de passe
 *
 * @example
 * const hashed = await hashPassword('SecureP@ss123');
 * const isValid = await verifyPassword('SecureP@ss123', hashed);
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.trim().length === 0) {
    throw new Error('Le mot de passe ne peut pas être vide');
  }

  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(plainPassword, hashedPassword);
}
