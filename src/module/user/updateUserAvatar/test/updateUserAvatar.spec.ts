import { UpdateUserAvatarUseCase } from '../UpdateUserAvatarUseCase';
import { UpdateUserAvatarRepository } from '../UpdateUserAvatarRepository';
import { AvatarUploadService } from '@/services/avatar-upload.service';

class UpdateUserAvatarDummyRepository implements UpdateUserAvatarRepository {
  async findById(_userId: string): Promise<{ id: string; email: string }> {
    return { id: 'user-123', email: 'test@example.com' };
  }

  async updateAvatar(_userId: string, _avatarUrl: string): Promise<void> {
    // Dummy implementation
  }
}

class UpdateUserAvatarNotFoundRepository implements UpdateUserAvatarRepository {
  async findById(
    _userId: string
  ): Promise<{ id: string; email: string } | null> {
    return null;
  }

  async updateAvatar(_userId: string, _avatarUrl: string): Promise<void> {
    // Dummy implementation
  }
}

class AvatarUploadDummyService implements AvatarUploadService {
  async upload(_file: Buffer, _fileName: string): Promise<string> {
    return 'https://cdn.vercel-storage.com/avatars/fake-avatar.jpg';
  }
}

describe('UpdateUserAvatarUseCase - US-15b', () => {
  it('devrait uploader un avatar JPEG avec succès (Scénario 1)', async () => {
    const repository = new UpdateUserAvatarDummyRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-123',
        file: Buffer.from('fake-jpeg-data'),
        fileName: 'avatar.jpg',
        fileType: 'image/jpeg',
        fileSize: 1 * 1024 * 1024, // 1 MB
      })
    ).resolves.not.toThrow();
  });

  it('devrait uploader un avatar PNG avec succès (Scénario 2)', async () => {
    const repository = new UpdateUserAvatarDummyRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-123',
        file: Buffer.from('fake-png-data'),
        fileName: 'avatar.png',
        fileType: 'image/png',
        fileSize: 500 * 1024, // 500 KB
      })
    ).resolves.not.toThrow();
  });

  it('devrait uploader un avatar WebP avec succès', async () => {
    const repository = new UpdateUserAvatarDummyRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-123',
        file: Buffer.from('fake-webp-data'),
        fileName: 'avatar.webp',
        fileType: 'image/webp',
        fileSize: 1.5 * 1024 * 1024, // 1.5 MB
      })
    ).resolves.not.toThrow();
  });

  it('devrait rejeter un fichier trop volumineux (Scénario 4)', async () => {
    const repository = new UpdateUserAvatarDummyRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-123',
        file: Buffer.from('fake-large-data'),
        fileName: 'avatar.jpg',
        fileType: 'image/jpeg',
        fileSize: 3 * 1024 * 1024, // 3 MB (> 2 MB max)
      })
    ).rejects.toThrow(/ne peut pas dépasser 2 MB/i);
  });

  it('devrait rejeter un format GIF non supporté (Scénario 5)', async () => {
    const repository = new UpdateUserAvatarDummyRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-123',
        file: Buffer.from('fake-gif-data'),
        fileName: 'avatar.gif',
        fileType: 'image/gif',
        fileSize: 1 * 1024 * 1024,
      })
    ).rejects.toThrow(/Format non supporté/i);
  });

  it('devrait rejeter un format PDF non supporté (Scénario 5)', async () => {
    const repository = new UpdateUserAvatarDummyRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-123',
        file: Buffer.from('fake-pdf-data'),
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1 * 1024 * 1024,
      })
    ).rejects.toThrow(/Format non supporté/i);
  });

  it('devrait rejeter si utilisateur introuvable', async () => {
    const repository = new UpdateUserAvatarNotFoundRepository();
    const uploadService = new AvatarUploadDummyService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await expect(
      useCase.execute({
        userId: 'user-999',
        file: Buffer.from('fake-image-data'),
        fileName: 'avatar.jpg',
        fileType: 'image/jpeg',
        fileSize: 1 * 1024 * 1024,
      })
    ).rejects.toThrow(/introuvable/i);
  });
});
