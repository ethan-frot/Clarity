/**
 * Use Case : Connexion utilisateur (US-10)
 *
 * Règle métier complexe :
 * - Message d'erreur volontairement vague pour éviter énumération d'emails
 */
import { SignInRepository } from "./SignInRepository";
import * as bcrypt from "bcryptjs";

export interface SignInCommand {
  email: string;
  password: string;
}

export interface SignInResult {
  userId: string;
  email: string;
  name?: string;
}

export class SignInUseCase {
  constructor(private repository: SignInRepository) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    try {
      this.validateEmail(command.email);
      this.validatePassword(command.password);

      const user = await this.repository.findByEmail(command.email);

      // Message vague pour sécurité (éviter énumération d'emails)
      if (!user) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const isPasswordValid = await bcrypt.compare(
        command.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect");
      }

      return {
        userId: user.id!,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Impossible de se connecter");
    }
  }

  private validateEmail(email: string): void {
    if (email === undefined || email === null) {
      throw new Error("L'email est requis");
    }

    if (typeof email !== "string" || email.trim().length === 0) {
      throw new Error("L'email est requis");
    }
  }

  private validatePassword(password: string): void {
    if (password === undefined || password === null) {
      throw new Error("Le mot de passe est requis");
    }

    if (typeof password !== "string" || password.trim().length === 0) {
      throw new Error("Le mot de passe est requis");
    }
  }
}
