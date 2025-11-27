import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { RegisterUserRepository } from '../RegisterUserRepository';
import { User } from '@/domain/user/User';

class RegisterUserDummyRepository implements RegisterUserRepository {
  async save(user: User): Promise<string> {
    return 'fake-user-id-123';
  }

  async emailExists(email: string): Promise<boolean> {
    return false;
  }
}

class RegisterUserDummyRepositoryWithExistingEmail implements RegisterUserRepository {
  async save(user: User): Promise<string> {
    throw new Error('Ne devrait jamais être appelé');
  }

  async emailExists(email: string): Promise<boolean> {
    return email === 'existing@example.com';
  }
}

describe('RegisterUserUseCase (US-9)', () => {
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
