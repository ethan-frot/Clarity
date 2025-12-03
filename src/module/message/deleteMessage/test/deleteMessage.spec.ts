import { DeleteMessageUseCase } from '../DeleteMessageUseCase';
import { DeleteMessageRepository } from '../DeleteMessageRepository';
import { Message } from '@/domain/message/Message';

class DeleteMessageDummyRepository implements DeleteMessageRepository {
  private message: Message | null;

  constructor(message: Message | null = null) {
    this.message = message;
  }

  async findById(_id: string): Promise<Message | null> {
    return this.message;
  }

  async delete(_message: Message): Promise<void> {
    return;
  }
}

describe('DeleteMessageUseCase (US-8)', () => {
  it('devrait supprimer un message avec succès', async () => {
    // Étant donné
    const message = new Message({
      id: 'message-123',
      content: 'Contenu du message',
      authorId: 'user-123',
      conversationId: 'conv-123',
    });
    const repository = new DeleteMessageDummyRepository(message);
    const useCase = new DeleteMessageUseCase(repository);

    // Quand
    await useCase.execute({
      messageId: 'message-123',
      userId: 'user-123',
    });

    // Alors
    expect(message.deletedAt).toBeDefined();
    expect(message.deletedAt).toBeInstanceOf(Date);
  });

  it("devrait rejeter si le message n'existe pas", async () => {
    // Étant donné
    const repository = new DeleteMessageDummyRepository(null);
    const useCase = new DeleteMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        messageId: 'message-999',
        userId: 'user-123',
      })
    ).rejects.toThrow('Message non trouvé');
  });

  it("devrait rejeter si l'utilisateur n'est pas le propriétaire", async () => {
    // Étant donné
    const message = new Message({
      id: 'message-123',
      content: 'Contenu du message',
      authorId: 'user-123',
      conversationId: 'conv-123',
    });
    const repository = new DeleteMessageDummyRepository(message);
    const useCase = new DeleteMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        messageId: 'message-123',
        userId: 'user-456',
      })
    ).rejects.toThrow("Vous n'êtes pas autorisé à supprimer ce message");
  });

  it('devrait rejeter si le message est déjà supprimé', async () => {
    // Étant donné
    const message = new Message({
      id: 'message-123',
      content: 'Contenu du message',
      authorId: 'user-123',
      conversationId: 'conv-123',
      deletedAt: new Date(),
    });
    const repository = new DeleteMessageDummyRepository(message);
    const useCase = new DeleteMessageUseCase(repository);

    // Quand / Alors
    await expect(
      useCase.execute({
        messageId: 'message-123',
        userId: 'user-123',
      })
    ).rejects.toThrow('Message non trouvé');
  });
});
