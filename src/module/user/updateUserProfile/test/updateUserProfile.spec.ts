import { UpdateUserProfileUseCase } from '../UpdateUserProfileUseCase';
import { UpdateUserProfileRepository } from '../UpdateUserProfileRepository';
import { User } from '@/domain/user/User';

class UpdateUserProfileDummyRepository implements UpdateUserProfileRepository {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach((user) => {
      if (user.id) {
        this.users.set(user.id, user);
      }
    });
  }

  async findById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async update(
    userId: string,
    data: { name?: string | null; bio?: string | null }
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const updatedUser = new User({
      id: user.id,
      email: user.email,
      name: data.name === null ? undefined : (data.name ?? user.name),
      bio: data.bio === null ? undefined : (data.bio ?? user.bio),
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });

    this.users.set(userId, updatedUser);
  }
}

describe('UpdateUserProfileUseCase', () => {
  it('devrait modifier le nom avec succès', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
      bio: 'Dev',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand
    await useCase.execute({
      userId: 'user-123',
      name: 'Alice Dupont',
    });

    // Alors
    const updatedUser = await repository.findById('user-123');
    expect(updatedUser?.name).toBe('Alice Dupont');
    expect(updatedUser?.bio).toBe('Dev'); // Bio inchangée
  });

  it('devrait modifier la bio avec succès', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
      bio: 'Dev',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand
    await useCase.execute({
      userId: 'user-123',
      bio: 'Développeuse passionnée par Next.js',
    });

    // Alors
    const updatedUser = await repository.findById('user-123');
    expect(updatedUser?.name).toBe('Alice'); // Nom inchangé
    expect(updatedUser?.bio).toBe('Développeuse passionnée par Next.js');
  });

  it('devrait modifier le nom et la bio avec succès', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
      bio: 'Dev',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand
    await useCase.execute({
      userId: 'user-123',
      name: 'Alice Dupont',
      bio: 'Développeuse web',
    });

    // Alors
    const updatedUser = await repository.findById('user-123');
    expect(updatedUser?.name).toBe('Alice Dupont');
    expect(updatedUser?.bio).toBe('Développeuse web');
  });

  it('devrait supprimer le nom (null)', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
      bio: 'Dev',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand
    await useCase.execute({
      userId: 'user-123',
      name: null,
    });

    // Alors
    const updatedUser = await repository.findById('user-123');
    expect(updatedUser?.name).toBeUndefined();
    expect(updatedUser?.bio).toBe('Dev'); // Bio inchangée
  });

  it('devrait supprimer la bio (null)', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
      bio: 'Dev',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand
    await useCase.execute({
      userId: 'user-123',
      bio: null,
    });

    // Alors
    const updatedUser = await repository.findById('user-123');
    expect(updatedUser?.name).toBe('Alice'); // Nom inchangé
    expect(updatedUser?.bio).toBeUndefined();
  });

  it('devrait rejeter un nom trop long', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        userId: 'user-123',
        name: 'a'.repeat(101), // > 100 caractères
      })
    ).rejects.toThrow('nom');
  });

  it('devrait rejeter une bio trop longue', async () => {
    // Étant donné
    const existingUser = new User({
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
    });
    const repository = new UpdateUserProfileDummyRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        userId: 'user-123',
        bio: 'a'.repeat(501), // > 500 caractères
      })
    ).rejects.toThrow('bio');
  });

  it("devrait rejeter si l'utilisateur n'existe pas", async () => {
    // Étant donné
    const repository = new UpdateUserProfileDummyRepository([]);
    const useCase = new UpdateUserProfileUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        userId: 'user-999',
        name: 'Bob',
      })
    ).rejects.toThrow('Utilisateur introuvable');
  });
});
