import { GetUserContributionsRepository } from './GetUserContributionsRepository';
import { UserContributions } from './types/getUserContributions.types';

export class GetUserContributionsUseCase {
  constructor(private repository: GetUserContributionsRepository) {}

  async execute(userId: string): Promise<UserContributions> {
    try {
      const contributions = await this.repository.findUserContributions(userId);

      if (!contributions) {
        throw new Error('Utilisateur non trouvé');
      }

      return contributions;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Utilisateur non trouvé')) {
          throw error;
        }
        throw new Error(
          `Impossible de récupérer les contributions : ${error.message}`
        );
      }
      throw error;
    }
  }
}
