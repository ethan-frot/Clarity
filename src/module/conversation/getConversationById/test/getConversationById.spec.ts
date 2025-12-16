import { GetConversationByIdUseCase } from '../GetConversationByIdUseCase';
import { GetConversationByIdRepository } from '../GetConversationByIdRepository';
import { ConversationWithMessages } from '../types/getConversationById.types';

class GetConversationByIdDummyRepository implements GetConversationByIdRepository {
  private conversations: Map<string, ConversationWithMessages | null> =
    new Map();

  setConversation(
    id: string,
    conversation: ConversationWithMessages | null
  ): void {
    this.conversations.set(id, conversation);
  }

  async findById(id: string): Promise<ConversationWithMessages | null> {
    return this.conversations.get(id) || null;
  }
}

describe('GetConversationByIdUseCase (US-3)', () => {
  it('devrait récupérer une conversation avec ses messages triés chronologiquement', async () => {
    // Étant donné
    const repository = new GetConversationByIdDummyRepository();
    const useCase = new GetConversationByIdUseCase(repository);

    const mockConversation: ConversationWithMessages = {
      id: 'conv-123',
      title: 'Ma conversation',
      authorId: 'user-123',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      author: {
        id: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        avatar: null,
      },
      messages: [
        {
          id: 'msg-1',
          content: 'Premier message',
          authorId: 'user-123',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
          author: {
            id: 'user-123',
            name: 'Alice',
            email: 'alice@example.com',
            avatar: null,
          },
        },
        {
          id: 'msg-2',
          content: 'Deuxième message',
          authorId: 'user-456',
          createdAt: new Date('2024-01-01T10:05:00Z'),
          updatedAt: new Date('2024-01-01T10:05:00Z'),
          author: {
            id: 'user-456',
            name: 'Bob',
            email: 'bob@example.com',
            avatar: null,
          },
        },
        {
          id: 'msg-3',
          content: 'Troisième message',
          authorId: 'user-123',
          createdAt: new Date('2024-01-01T10:10:00Z'),
          updatedAt: new Date('2024-01-01T10:10:00Z'),
          author: {
            id: 'user-123',
            name: 'Alice',
            email: 'alice@example.com',
            avatar: null,
          },
        },
      ],
    };

    repository.setConversation('conv-123', mockConversation);

    // Quand
    const result = await useCase.execute('conv-123');

    // Alors
    expect(result).toBeDefined();
    expect(result.id).toBe('conv-123');
    expect(result.title).toBe('Ma conversation');
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content).toBe('Premier message');
    expect(result.messages[1].content).toBe('Deuxième message');
    expect(result.messages[2].content).toBe('Troisième message');
    expect(result.author.name).toBe('Alice');
  });

  it('devrait rejeter une conversation introuvable', async () => {
    // Étant donné
    const repository = new GetConversationByIdDummyRepository();
    const useCase = new GetConversationByIdUseCase(repository);

    repository.setConversation('conv-999', null);

    // Quand / Alors
    await expect(useCase.execute('conv-999')).rejects.toThrow(
      'Conversation non trouvée'
    );
  });

  it('devrait rejeter une conversation supprimée', async () => {
    // Étant donné
    const repository = new GetConversationByIdDummyRepository();
    const useCase = new GetConversationByIdUseCase(repository);

    repository.setConversation('conv-456', null);

    // Quand / Alors
    await expect(useCase.execute('conv-456')).rejects.toThrow(
      'Conversation non trouvée'
    );
  });
});
