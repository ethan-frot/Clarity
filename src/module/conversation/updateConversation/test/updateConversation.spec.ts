import { UpdateConversationUseCase } from '../UpdateConversationUseCase';
import { UpdateConversationRepository } from '../UpdateConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';

class UpdateConversationDummyRepository implements UpdateConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    if (id === 'fake-conversation-id') {
      return new Conversation({
        id: 'fake-conversation-id',
        title: 'Ancien titre',
        authorId: 'user-123',
        createdAt: new Date(),
      });
    }
    return null;
  }

  async update(_conversation: Conversation): Promise<void> {
    // Ne fait rien (dummy)
  }
}

class UpdateConversationNotOwnerRepository implements UpdateConversationRepository {
  async findById(_id: string): Promise<Conversation | null> {
    return new Conversation({
      id: 'fake-conversation-id',
      title: 'Ancien titre',
      authorId: 'other-user-456',
      createdAt: new Date(),
    });
  }

  async update(_conversation: Conversation): Promise<void> {
    // Ne fait rien (dummy)
  }
}

describe('UpdateConversationUseCase (US-4)', () => {
  it("devrait modifier le titre d'une conversation avec succès", async () => {
    // Étant donné
    const repository = new UpdateConversationDummyRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      conversationId: 'fake-conversation-id',
      newTitle: 'Nouveau titre',
      userId: 'user-123',
    });

    // Alors
    expect(result.success).toBe(true);
  });

  it('devrait rejeter un titre vide', async () => {
    // Étant donné
    const repository = new UpdateConversationDummyRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'fake-conversation-id',
        newTitle: '',
        userId: 'user-123',
      })
    ).rejects.toThrow('titre');
  });

  it('devrait rejeter un titre trop long', async () => {
    // Étant donné
    const repository = new UpdateConversationDummyRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'fake-conversation-id',
        newTitle: 'a'.repeat(201),
        userId: 'user-123',
      })
    ).rejects.toThrow('titre');
  });

  it("devrait rejeter si la conversation n'existe pas", async () => {
    // Étant donné
    const repository = new UpdateConversationDummyRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'non-existent-id',
        newTitle: 'Nouveau titre',
        userId: 'user-123',
      })
    ).rejects.toThrow('Conversation non trouvée');
  });

  it("devrait rejeter si l'utilisateur n'est pas le propriétaire", async () => {
    // Étant donné
    const repository = new UpdateConversationNotOwnerRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'fake-conversation-id',
        newTitle: 'Nouveau titre',
        userId: 'user-123',
      })
    ).rejects.toThrow('Non autorisé');
  });

  it('devrait accepter un titre de 1 caractère', async () => {
    // Étant donné
    const repository = new UpdateConversationDummyRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      conversationId: 'fake-conversation-id',
      newTitle: 'A',
      userId: 'user-123',
    });

    // Alors
    expect(result.success).toBe(true);
  });

  it('devrait accepter un titre de 200 caractères', async () => {
    // Étant donné
    const repository = new UpdateConversationDummyRepository();
    const useCase = new UpdateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      conversationId: 'fake-conversation-id',
      newTitle: 'a'.repeat(200),
      userId: 'user-123',
    });

    // Alors
    expect(result.success).toBe(true);
  });
});
