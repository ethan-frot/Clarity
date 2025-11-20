/**
 * Tests Unitaires : RegisterUserUseCase (US-9)
 *
 * Ces tests vérifient la logique métier de l'inscription
 * en isolation, sans base de données ni HTTP.
 *
 * On utilise des test doubles (dummy repositories) qui implémentent
 * l'interface RegisterUserRepository.
 *
 * Scénarios testés (conformément aux specs) :
 * ✅ Inscription réussie avec nom
 * ✅ Inscription réussie sans nom
 * ❌ Inscription échouée - email déjà utilisé
 * ❌ Inscription échouée - email invalide
 * ❌ Inscription échouée - mot de passe trop court
 * ❌ Inscription échouée - mot de passe sans majuscule
 * ❌ Inscription échouée - mot de passe sans chiffre
 * ❌ Inscription échouée - mot de passe sans caractère spécial
 */

import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { RegisterUserRepository } from '../RegisterUserRepository';
import { User } from '@/domain/user/User';

// ==================== TEST DOUBLES ====================

/**
 * Dummy Repository - Simule un repository sans email existant
 */
class RegisterUserDummyRepository implements RegisterUserRepository {
  async save(user: User): Promise<string> {
    return 'fake-user-id-123';
  }

  async emailExists(email: string): Promise<boolean> {
    return false; // Aucun email n'existe
  }
}

/**
 * Dummy Repository - Simule un email déjà existant
 */
class RegisterUserDummyRepositoryWithExistingEmail implements RegisterUserRepository {
  async save(user: User): Promise<string> {
    throw new Error('Ne devrait jamais être appelé');
  }

  async emailExists(email: string): Promise<boolean> {
    return email === 'existing@example.com'; // Cet email existe déjà
  }
}

// ==================== TESTS ====================

describe('RegisterUserUseCase (US-9)', () => {
  // ==================== SCÉNARIO 1 : Inscription réussie avec nom ====================
  it('devrait créer un utilisateur avec succès (avec nom)', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand
    const result = await useCase.execute({
      email: 'alice@example.com',
      password: 'SecureP@ss123',
      name: 'Alice Dupont',
    });

    // Alors
    expect(result.userId).toBe('fake-user-id-123');
    expect(result.email).toBe('alice@example.com');
    expect(result.name).toBe('Alice Dupont');
  });

  // ==================== SCÉNARIO 2 : Inscription réussie sans nom ====================
  it('devrait créer un utilisateur avec succès (sans nom)', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand
    const result = await useCase.execute({
      email: 'bob@example.com',
      password: 'MyP@ssw0rd',
    });

    // Alors
    expect(result.userId).toBe('fake-user-id-123');
    expect(result.email).toBe('bob@example.com');
    expect(result.name).toBeUndefined();
  });

  // ==================== SCÉNARIO 3 : Inscription échouée - email déjà utilisé ====================
  it('devrait rejeter une inscription avec un email déjà utilisé', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepositoryWithExistingEmail();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'existing@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      })
    ).rejects.toThrow('déjà utilisé');
  });

  // ==================== SCÉNARIO 4 : Inscription échouée - email invalide ====================
  it('devrait rejeter une inscription avec un email invalide', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'invalid-email',
        password: 'SecureP@ss123',
      })
    ).rejects.toThrow('email');
  });

  // ==================== SCÉNARIO 5 : Inscription échouée - mot de passe trop court ====================
  it('devrait rejeter un mot de passe trop court', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'Short1!',
      })
    ).rejects.toThrow('minimum 8 caractères');
  });

  // ==================== SCÉNARIO 6 : Inscription échouée - mot de passe sans majuscule ====================
  it('devrait rejeter un mot de passe sans majuscule', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'password123!',
      })
    ).rejects.toThrow('majuscule');
  });

  // ==================== SCÉNARIO 7 : Inscription échouée - mot de passe sans chiffre ====================
  it('devrait rejeter un mot de passe sans chiffre', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'Password!',
      })
    ).rejects.toThrow('chiffre');
  });

  // ==================== SCÉNARIO 8 : Inscription échouée - mot de passe sans caractère spécial ====================
  it('devrait rejeter un mot de passe sans caractère spécial', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'Password123',
      })
    ).rejects.toThrow('caractère spécial');
  });

  // ==================== TESTS ADDITIONNELS ====================

  it('devrait rejeter un nom trop long (> 100 caractères)', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'a'.repeat(101),
      })
    ).rejects.toThrow('nom');
  });

  it('devrait rejeter un email trop long (> 255 caractères)', async () => {
    // Étant donné
    const repository = new RegisterUserDummyRepository();
    const useCase = new RegisterUserUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        email: 'a'.repeat(250) + '@example.com',
        password: 'SecureP@ss123',
      })
    ).rejects.toThrow('email');
  });
});
