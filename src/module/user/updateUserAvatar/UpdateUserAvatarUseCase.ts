import { UpdateUserAvatarRepository } from './UpdateUserAvatarRepository';
import { AvatarUploadService } from '@/services/avatar-upload.service';
import {
  UpdateUserAvatarCommand,
  AVATAR_VALIDATION,
} from './types/updateUserAvatar.types';

export class UpdateUserAvatarUseCase {
  constructor(
    private repository: UpdateUserAvatarRepository,
    private uploadService: AvatarUploadService
  ) {}

  async execute(command: UpdateUserAvatarCommand): Promise<void> {
    try {
      const existingUser = await this.repository.findById(command.userId);

      if (!existingUser) {
        throw new Error('Utilisateur introuvable');
      }

      this.validateFile(command);

      const avatarUrl = await this.uploadService.upload(
        command.file,
        command.fileName
      );

      await this.repository.updateAvatar(command.userId, avatarUrl);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Impossible de mettre à jour l'avatar: ${error.message}`
        );
      }
      throw error;
    }
  }

  private validateFile(command: UpdateUserAvatarCommand): void {
    if (command.fileSize > AVATAR_VALIDATION.maxSize) {
      throw new Error("L'image ne peut pas dépasser 2 MB");
    }

    const isValidType = (
      AVATAR_VALIDATION.acceptedTypes as readonly string[]
    ).includes(command.fileType);

    if (!isValidType) {
      throw new Error('Format non supporté (JPEG, PNG, WebP uniquement)');
    }
  }
}
