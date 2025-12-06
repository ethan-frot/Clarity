import { UpdateUserProfileRepository } from './UpdateUserProfileRepository';
import { User } from '@/domain/user/User';

interface UpdateUserProfileCommand {
  userId: string;
  name?: string | null;
  bio?: string | null;
}

export class UpdateUserProfileUseCase {
  constructor(private repository: UpdateUserProfileRepository) {}

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    try {
      const existingUser = await this.repository.findById(command.userId);

      if (!existingUser) {
        throw new Error('Utilisateur introuvable');
      }

      // Validation via entité User (validation métier dans le domain)
      new User({
        id: existingUser.id,
        email: existingUser.email,
        name:
          command.name === null
            ? undefined
            : (command.name ?? existingUser.name),
        bio:
          command.bio === null ? undefined : (command.bio ?? existingUser.bio),
        avatar: existingUser.avatar,
        createdAt: existingUser.createdAt,
      });

      await this.repository.update(command.userId, {
        name: command.name,
        bio: command.bio,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Impossible de mettre à jour le profil: ${error.message}`
        );
      }
      throw error;
    }
  }
}
