import { SignOutUseCase } from '../SignOutUseCase';
import { SignOutRepository } from '../SignOutRepository';

class SignOutDummyRepository implements SignOutRepository {
  private sessionsByUser: Map<string, number> = new Map([
    ['user-123', 2],
    ['user-456', 1],
  ]);

  async revokeAllUserSessions(userId: string): Promise<number> {
    const count = this.sessionsByUser.get(userId) || 0;
    this.sessionsByUser.set(userId, 0);
    return count;
  }
}

describe('SignOutUseCase (US-11)', () => {
  describe('Scénario 1 : Déconnexion réussie avec sessions actives', () => {
    it("devrait révoquer toutes les sessions actives de l'utilisateur", async () => {
      // Étant donné
      const repository = new SignOutDummyRepository();
      const useCase = new SignOutUseCase(repository);

      // Quand
      const result = await useCase.execute({
        userId: 'user-123',
      });

      // Alors
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.revokedSessions).toBe(2);
    });
  });

  describe('Scénario 2 : Déconnexion réussie sans sessions actives', () => {
    it('devrait retourner un succès même sans sessions actives', async () => {
      // Étant donné
      const repository = new SignOutDummyRepository();
      const useCase = new SignOutUseCase(repository);

      // Quand
      const result = await useCase.execute({
        userId: 'user-999',
      });

      // Alors
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.revokedSessions).toBe(0);
    });
  });

  describe('Scénario 3 : Validation - userId vide', () => {
    it('devrait rejeter un userId vide', async () => {
      // Étant donné
      const repository = new SignOutDummyRepository();
      const useCase = new SignOutUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          userId: '',
        })
      ).rejects.toThrow('userId');
    });
  });

  describe('Scénario 4 : Validation - userId non fourni', () => {
    it('devrait rejeter une requête sans userId', async () => {
      // Étant donné
      const repository = new SignOutDummyRepository();
      const useCase = new SignOutUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          userId: undefined as unknown as string,
        })
      ).rejects.toThrow('userId');
    });
  });

  describe('Scénario 5 : Validation - userId null', () => {
    it('devrait rejeter un userId null', async () => {
      // Étant donné
      const repository = new SignOutDummyRepository();
      const useCase = new SignOutUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          userId: null as unknown as string,
        })
      ).rejects.toThrow('userId');
    });
  });

  describe('Scénario 6 : Déconnexion avec une seule session', () => {
    it('devrait révoquer correctement une seule session', async () => {
      // Étant donné
      const repository = new SignOutDummyRepository();
      const useCase = new SignOutUseCase(repository);

      // Quand
      const result = await useCase.execute({
        userId: 'user-456',
      });

      // Alors
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.revokedSessions).toBe(1);
    });
  });
});
