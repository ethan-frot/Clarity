import { Conversation } from '@/domain/conversation/Conversation';
import {
  ConversationWithCount,
  ListConversationsRepository,
} from '../ListConversationsRepository';
import { ListConversationsUseCase } from '../ListConversationsUseCase';

class ListConversationsDummyRepository implements ListConversationsRepository {
  private conversations: ConversationWithCount[] = [];

  constructor(conversations: ConversationWithCount[] = []) {
    this.conversations = conversations;
  }

  async findAll(): Promise<ConversationWithCount[]> {
    return this.conversations
      .filter((conv) => !conv.deletedAt)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }
}

describe('ListConversationsUseCase (US-2)', () => {
  it('devrait retourner toutes les conversations triées par date (la plus récente en premier)', async () => {
    // Étant donné
    const conv1 = new Conversation({
      id: 'conv-1',
      title: 'Première conversation',
      authorId: 'user-1',
      createdAt: new Date('2025-01-01'),
    });

    const conv2 = new Conversation({
      id: 'conv-2',
      title: 'Deuxième conversation',
      authorId: 'user-2',
      createdAt: new Date('2025-01-02'),
    });

    const conv3 = new Conversation({
      id: 'conv-3',
      title: 'Troisième conversation',
      authorId: 'user-3',
      createdAt: new Date('2025-01-03'),
    });

    const conversationsWithCount: ConversationWithCount[] = [
      Object.assign(conv1, { messageCount: 5 }),
      Object.assign(conv2, { messageCount: 3 }),
      Object.assign(conv3, { messageCount: 10 }),
    ];

    const repository = new ListConversationsDummyRepository(conversationsWithCount);
    const useCase = new ListConversationsUseCase(repository);

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(3);
    expect(result.conversations[0].id).toBe('conv-3');
    expect(result.conversations[1].id).toBe('conv-2');
    expect(result.conversations[2].id).toBe('conv-1');
  });

  it('devrait exclure les conversations supprimées (deletedAt non null)', async () => {
    // Étant donné
    const conv1 = new Conversation({
      id: 'conv-1',
      title: 'Conversation active',
      authorId: 'user-1',
      createdAt: new Date('2025-01-01'),
      deletedAt: null,
    });

    const conv2 = new Conversation({
      id: 'conv-2',
      title: 'Conversation supprimée',
      authorId: 'user-2',
      createdAt: new Date('2025-01-02'),
      deletedAt: new Date('2025-01-10'),
    });

    const conversationsWithCount: ConversationWithCount[] = [
      Object.assign(conv1, { messageCount: 5 }),
      Object.assign(conv2, { messageCount: 3 }),
    ];

    const repository = new ListConversationsDummyRepository(conversationsWithCount);
    const useCase = new ListConversationsUseCase(repository);

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].id).toBe('conv-1');
  });

  it('devrait retourner un tableau vide si aucune conversation', async () => {
    // Étant donné
    const repository = new ListConversationsDummyRepository([]);
    const useCase = new ListConversationsUseCase(repository);

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(0);
    expect(result.conversations).toEqual([]);
  });

  it('devrait inclure le nombre de messages pour chaque conversation', async () => {
    // Étant donné
    const conv1 = new Conversation({
      id: 'conv-1',
      title: 'Conversation avec messages',
      authorId: 'user-1',
      createdAt: new Date('2025-01-01'),
    });

    const conversationsWithCount: ConversationWithCount[] = [
      Object.assign(conv1, { messageCount: 15 }),
    ];

    const repository = new ListConversationsDummyRepository(conversationsWithCount);
    const useCase = new ListConversationsUseCase(repository);

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].messageCount).toBe(15);
  });
});
