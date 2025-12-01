import { CreateMessageUseCase } from '../CreateMessageUseCase';
import { CreateMessageRepository } from '../CreateMessageRepository';
import { Message } from '@/domain/message/Message';

class CreateMessageDummyRepository implements CreateMessageRepository {
  async findConversationById(conversationId: string): Promise<boolean> {
    return conversationId !== 'conv-999';
  }

  async save(_message: Message): Promise<string> {
    return 'fake-message-id';
  }
}

class ConversationNotFoundRepository implements CreateMessageRepository {
  async findConversationById(): Promise<boolean> {
    return false;
  }

  async save(): Promise<string> {
    return 'fake-message-id';
  }
}

describe('CreateMessageUseCase (US-6)', () => {
  it('devrait créer un message avec succès', async () => {
    // Étant donné
    const repository = new CreateMessageDummyRepository();
    const useCase = new CreateMessageUseCase(repository);

    // Quand
    const result = await useCase.execute({
      content: 'Super discussion !',
      authorId: 'user-123',
      conversationId: 'conv-123',
    });

    // Alors
    expect(result.messageId).toBe('fake-message-id');
  });

  it('devrait rejeter un contenu vide', async () => {
    // Étant donné
    const repository = new CreateMessageDummyRepository();
    const useCase = new CreateMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        content: '',
        authorId: 'user-123',
        conversationId: 'conv-123',
      })
    ).rejects.toThrow('contenu');
  });

  it('devrait rejeter un contenu trop long', async () => {
    // Étant donné
    const repository = new CreateMessageDummyRepository();
    const useCase = new CreateMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        content: 'a'.repeat(2001),
        authorId: 'user-123',
        conversationId: 'conv-123',
      })
    ).rejects.toThrow('2000');
  });

  it("devrait rejeter si la conversation n'existe pas", async () => {
    // Étant donné
    const repository = new ConversationNotFoundRepository();
    const useCase = new CreateMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        content: 'Test',
        authorId: 'user-123',
        conversationId: 'conv-999',
      })
    ).rejects.toThrow('conversation');
  });

  it('devrait rejeter un authorId vide', async () => {
    // Étant donné
    const repository = new CreateMessageDummyRepository();
    const useCase = new CreateMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        content: 'Test',
        authorId: '',
        conversationId: 'conv-123',
      })
    ).rejects.toThrow('auteur');
  });
});
