/**
 * Use Case : Déconnexion utilisateur (US-11)
 */
import { SignOutRepository } from './SignOutRepository';

export interface SignOutCommand {
  userId: string;
}

export interface SignOutResult {
  success: boolean;
  revokedSessions: number;
}

export class SignOutUseCase {
  constructor(private repository: SignOutRepository) {}

  async execute(command: SignOutCommand): Promise<SignOutResult> {
    try {
      this.validateUserId(command.userId);

      const revokedCount = await this.repository.revokeAllUserSessions(
        command.userId
      );

      return {
        success: true,
        revokedSessions: revokedCount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Impossible de se déconnecter');
    }
  }

  private validateUserId(userId: string): void {
    if (userId === undefined || userId === null) {
      throw new Error("L'identifiant utilisateur (userId) est requis");
    }

    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error("L'identifiant utilisateur (userId) est requis");
    }
  }
}
