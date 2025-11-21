import { SignInRepository } from "./SignInRepository";
import * as bcrypt from "bcryptjs";

/**
 * Objet command pour le use case SignIn
 */
export interface SignInCommand {
  email: string;
  password: string;
}

/**
 * Objet résultat pour le use case SignIn
 * Note : Le mot de passe n'est JAMAIS retourné pour des raisons de sécurité
 */
export interface SignInResult {
  userId: string;
  email: string;
  name?: string;
}

/**
 * Use Case : Connexion (Sign In) - US-10
 *
 * Authentifie un utilisateur avec email et mot de passe.
 *
 * Règles métier :
 * - L'email et le mot de passe sont obligatoires
 * - L'email doit exister en base de données
 * - Le mot de passe doit correspondre au hash (comparaison bcrypt)
 * - Retourne les infos utilisateur SANS le mot de passe
 *
 * @throws Error si la validation échoue ou si les identifiants sont incorrects
 */
export class SignInUseCase {
  constructor(private repository: SignInRepository) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    try {
      // 1. Valider les entrées
      this.validateEmail(command.email);
      this.validatePassword(command.password);

      // 2. Rechercher l'utilisateur par email
      const user = await this.repository.findByEmail(command.email);

      if (!user) {
        // Sécurité : Ne pas révéler si l'email existe ou non
        throw new Error("Email ou mot de passe incorrect");
      }

      // 3. Vérifier le mot de passe avec bcrypt
      const isPasswordValid = await bcrypt.compare(
        command.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect");
      }

      // 4. Retourner les infos utilisateur (SANS le mot de passe)
      return {
        userId: user.id!,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      // Erreurs métier : relancer telles quelles
      if (error instanceof Error) {
        throw error;
      }
      // Erreurs inattendues : encapsuler avec contexte
      throw new Error("Impossible de se connecter");
    }
  }

  /**
   * Valide l'entrée email
   * @throws Error si l'email est invalide
   */
  private validateEmail(email: string): void {
    if (email === undefined || email === null) {
      throw new Error("L'email est requis");
    }

    if (typeof email !== "string" || email.trim().length === 0) {
      throw new Error("L'email est requis");
    }
  }

  /**
   * Valide l'entrée mot de passe
   * @throws Error si le mot de passe est invalide
   */
  private validatePassword(password: string): void {
    if (password === undefined || password === null) {
      throw new Error("Le mot de passe est requis");
    }

    if (typeof password !== "string" || password.trim().length === 0) {
      throw new Error("Le mot de passe est requis");
    }
  }
}
