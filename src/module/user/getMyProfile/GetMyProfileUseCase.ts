import { GetMyProfileRepository } from './GetMyProfileRepository';
import { UserProfileDTO } from './types/getMyProfile.types';

interface GetMyProfileCommand {
  userId: string;
}

export class GetMyProfileUseCase {
  constructor(private repository: GetMyProfileRepository) {}

  async execute(command: GetMyProfileCommand): Promise<UserProfileDTO> {
    try {
      if (!command.userId || command.userId.trim().length === 0) {
        throw new Error('userId est requis');
      }

      const profile = await this.repository.findByIdForProfile(command.userId);

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Impossible de récupérer le profil utilisateur');
    }
  }
}
