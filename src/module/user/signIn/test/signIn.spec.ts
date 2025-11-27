import { SignInUseCase } from '../SignInUseCase';
import { SignInRepository } from '../SignInRepository';
import { User } from '@/domain/user/User';
import * as bcrypt from 'bcryptjs';

class SignInDummyRepository implements SignInRepository {
  async findByEmail(email: string): Promise<User | null> {
    if (email === 'alice@example.com') {
      const hashedPassword = await bcrypt.hash('SecureP@ss123', 10);
      return new User({
        id: 'user-123',
        email: 'alice@example.com',
        password: hashedPassword,
        name: 'Alice Dupont',
      });
    }
    return null;
  }
}

describe('SignInUseCase (US-10)', () => {
  describe('Scénario 1 : Connexion réussie', () => {
    it('devrait authentifier un utilisateur avec des credentials valides', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand
      const result = await useCase.execute({
        email: 'alice@example.com',
        password: 'SecureP@ss123',
      });

      // Alors
      expect(result).toBeDefined();
      expect(result.userId).toBe('user-123');
      expect(result.email).toBe('alice@example.com');
      expect(result.name).toBe('Alice Dupont');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('Scénario 2 : Connexion échouée - email inexistant', () => {
    it('devrait rejeter un email qui n\'existe pas en base', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          email: 'unknown@example.com',
          password: 'SomePassword123!',
        })
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('Scénario 3 : Connexion échouée - mot de passe incorrect', () => {
    it('devrait rejeter un mot de passe incorrect', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          email: 'alice@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('Scénario 4 : Validation - email vide', () => {
    it('devrait rejeter un email vide', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          email: '',
          password: 'SecureP@ss123',
        })
      ).rejects.toThrow('email');
    });
  });

  describe('Scénario 5 : Validation - password vide', () => {
    it('devrait rejeter un mot de passe vide', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          email: 'alice@example.com',
          password: '',
        })
      ).rejects.toThrow('mot de passe');
    });
  });

  describe('Scénario 6 : Validation - email non fourni', () => {
    it('devrait rejeter une requête sans email', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          email: undefined as any,
          password: 'SecureP@ss123',
        })
      ).rejects.toThrow('email');
    });
  });

  describe('Scénario 7 : Validation - password non fourni', () => {
    it('devrait rejeter une requête sans mot de passe', async () => {
      // Étant donné
      const repository = new SignInDummyRepository();
      const useCase = new SignInUseCase(repository);

      // Quand / Alors
      await expect(
        useCase.execute({
          email: 'alice@example.com',
          password: undefined as any,
        })
      ).rejects.toThrow('mot de passe');
    });
  });
});
