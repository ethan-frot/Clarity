import { DeleteConversationUseCase } from '../DeleteConversationUseCase';
import { DeleteConversationRepository } from '../DeleteConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';

class DeleteConversationDummyRepository implements DeleteConversationRepository {
  private conversations: Map<string, Conversation> = new Map();

  constructor(initialConversations: Conversation[] = []) {
    initialConversations.forEach((conv) => {
      if (conv.id) {
        this.conversations.set(conv.id, conv);
      }
    });
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async delete(id: string): Promise<void> {
    this.conversations.delete(id);
  }
}

describe('DeleteConversationUseCase (US-5)', () => {
  it('devrait supprimer une conversation avec succès', async () => {
    // Étant donné
    const conversation = new Conversation({
      id: 'conv-123',
      title: 'Test Conversation',
      authorId: 'user-123',
    });
    const repository = new DeleteConversationDummyRepository([conversation]);
    const useCase = new DeleteConversationUseCase(repository);

    // Quand
    await useCase.execute({
      conversationId: 'conv-123',
      userId: 'user-123',
    });

    // Alors
    const deletedConv = await repository.findById('conv-123');
    expect(deletedConv).toBeNull();
  });

  it('devrait rejeter si la conversation est introuvable', async () => {
    // Étant donné
    const repository = new DeleteConversationDummyRepository([]);
    const useCase = new DeleteConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'conv-999',
        userId: 'user-123',
      })
    ).rejects.toThrow('Conversation non trouvée');
  });

  it("devrait rejeter si l'utilisateur n'est pas le propriétaire", async () => {
    // Étant donné
    const conversation = new Conversation({
      id: 'conv-123',
      title: 'Test Conversation',
      authorId: 'user-123',
    });
    const repository = new DeleteConversationDummyRepository([conversation]);
    const useCase = new DeleteConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'conv-123',
        userId: 'user-456',
      })
    ).rejects.toThrow('autorisé');
  });

  it('devrait rejeter si la conversation est déjà supprimée', async () => {
    // Étant donné
    const conversation = new Conversation({
      id: 'conv-123',
      title: 'Test Conversation',
      authorId: 'user-123',
      deletedAt: new Date(),
    });
    const repository = new DeleteConversationDummyRepository([conversation]);
    const useCase = new DeleteConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'conv-123',
        userId: 'user-123',
      })
    ).rejects.toThrow('Conversation non trouvée');
  });
});
