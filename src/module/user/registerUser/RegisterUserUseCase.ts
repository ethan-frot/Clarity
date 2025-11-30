/**
 * Use Case : Inscription utilisateur (US-9)
 *
 * Règle métier complexe :
 * - Validation avec mot de passe en clair, puis hachage bcrypt (10 rounds)
 */
import { RegisterUserRepository } from './RegisterUserRepository';
import { User } from '@/domain/user/User';
import { hashPassword } from '@/lib/password';

export interface RegisterUserCommand {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterUserResult {
  userId: string;
  email: string;
  name?: string;
}

export class RegisterUserUseCase {
  constructor(private repository: RegisterUserRepository) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    try {
      const emailAlreadyExists = await this.repository.emailExists(
        command.email
      );
      if (emailAlreadyExists) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Validation avec mot de passe en clair
      const user = new User({
        email: command.email,
        password: command.password,
        name: command.name,
      });

      // Hachage après validation réussie
      const hashedPassword = await hashPassword(command.password);
      const userToSave = new User({
        email: user.email,
        password: hashedPassword,
        name: user.name,
      });

      const userId = await this.repository.save(userToSave);

      return {
        userId,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('email') ||
          error.message.includes('mot de passe') ||
          error.message.includes('nom')
        ) {
          throw error;
        }

        throw new Error(`Impossible de créer le compte : ${error.message}`);
      }

      throw error;
    }
  }
}
