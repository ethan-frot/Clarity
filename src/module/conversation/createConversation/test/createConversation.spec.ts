import { CreateConversationUseCase } from '../CreateConversationUseCase';
import { CreateConversationRepository } from '../CreateConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';
import { Message } from '@/domain/message/Message';

/**
 * Test double (dummy) pour CreateConversationRepository
 */
class CreateConversationDummyRepository implements CreateConversationRepository {
  async save(
    _conversation: Conversation,
    _firstMessage: Message
  ): Promise<string> {
    return 'fake-conversation-id';
  }
}

describe('CreateConversationUseCase (US-1)', () => {
  it('devrait créer une conversation avec succès', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      title: 'Bienvenue sur le forum',
      content: 'Bonjour à tous !',
      authorId: 'user-123',
    });

    // Alors
    expect(result.conversationId).toBe('fake-conversation-id');
  });

  it('devrait rejeter un titre vide', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        title: '',
        content: 'Contenu valide',
        authorId: 'user-123',
      })
    ).rejects.toThrow('titre');
  });

  it('devrait rejeter un titre trop long', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        title: 'a'.repeat(201),
        content: 'Contenu valide',
        authorId: 'user-123',
      })
    ).rejects.toThrow('titre');
  });

  it('devrait rejeter un contenu vide', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        title: 'Titre valide',
        content: '',
        authorId: 'user-123',
      })
    ).rejects.toThrow('contenu');
  });

  it('devrait rejeter un contenu trop long', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        title: 'Titre valide',
        content: 'a'.repeat(2001),
        authorId: 'user-123',
      })
    ).rejects.toThrow('contenu');
  });

  it('devrait rejeter un authorId vide', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        title: 'Titre valide',
        content: 'Contenu valide',
        authorId: '',
      })
    ).rejects.toThrow('auteur');
  });

  it('devrait créer une conversation avec un titre au minimum de 1 caractère', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      title: 'A',
      content: 'Contenu valide',
      authorId: 'user-123',
    });

    // Alors
    expect(result.conversationId).toBe('fake-conversation-id');
  });

  it('devrait créer une conversation avec un titre de 200 caractères', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      title: 'a'.repeat(200),
      content: 'Contenu valide',
      authorId: 'user-123',
    });

    // Alors
    expect(result.conversationId).toBe('fake-conversation-id');
  });

  it('devrait créer une conversation avec un contenu de 2000 caractères', async () => {
    // Étant donné
    const repository = new CreateConversationDummyRepository();
    const useCase = new CreateConversationUseCase(repository);

    // Quand
    const result = await useCase.execute({
      title: 'Titre valide',
      content: 'a'.repeat(2000),
      authorId: 'user-123',
    });

    // Alors
    expect(result.conversationId).toBe('fake-conversation-id');
  });
});
