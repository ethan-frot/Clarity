import { GetMyProfileUseCase } from '../GetMyProfileUseCase';
import { GetMyProfileRepository } from '../GetMyProfileRepository';
import { UserProfileDTO } from '../types/getMyProfile.types';

class GetMyProfileDummyRepository implements GetMyProfileRepository {
  async findByIdForProfile(_userId: string): Promise<UserProfileDTO> {
    return {
      id: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
      bio: 'Test bio',
      avatar: null,
    };
  }
}

class GetMyProfileDummyRepositoryUserNotFound implements GetMyProfileRepository {
  async findByIdForProfile(_userId: string): Promise<UserProfileDTO> {
    throw new Error('Utilisateur non trouvé');
  }
}

describe('GetMyProfileUseCase', () => {
  describe('Cas de succès', () => {
    it('devrait récupérer le profil avec succès', async () => {
      const repository = new GetMyProfileDummyRepository();
      const useCase = new GetMyProfileUseCase(repository);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        bio: 'Test bio',
        avatar: null,
      });
    });

    it('devrait récupérer un profil avec name et bio null', async () => {
      class DummyRepoNullFields implements GetMyProfileRepository {
        async findByIdForProfile(_userId: string): Promise<UserProfileDTO> {
          return {
            id: 'user-456',
            email: 'user@example.com',
            name: null,
            bio: null,
            avatar: null,
          };
        }
      }

      const repository = new DummyRepoNullFields();
      const useCase = new GetMyProfileUseCase(repository);

      const result = await useCase.execute({ userId: 'user-456' });

      expect(result.name).toBeNull();
      expect(result.bio).toBeNull();
    });
  });

  describe("Cas d'erreur", () => {
    it('devrait rejeter si utilisateur inexistant', async () => {
      const repository = new GetMyProfileDummyRepositoryUserNotFound();
      const useCase = new GetMyProfileUseCase(repository);

      await expect(
        useCase.execute({ userId: 'nonexistent-user' })
      ).rejects.toThrow('Utilisateur non trouvé');
    });

    it('devrait rejeter si userId est vide', async () => {
      const repository = new GetMyProfileDummyRepository();
      const useCase = new GetMyProfileUseCase(repository);

      await expect(useCase.execute({ userId: '' })).rejects.toThrow(
        'userId est requis'
      );
    });
  });
});
