import { DeleteMessageRepository } from './DeleteMessageRepository';

export interface DeleteMessageCommand {
  messageId: string;
  userId: string;
}

export class DeleteMessageUseCase {
  constructor(private repository: DeleteMessageRepository) {}

  async execute(command: DeleteMessageCommand): Promise<void> {
    try {
      const message = await this.repository.findById(command.messageId);

      if (!message || message.deletedAt) {
        throw new Error('Message non trouvé');
      }

      if (message.authorId !== command.userId) {
        throw new Error("Vous n'êtes pas autorisé à supprimer ce message");
      }

      message.delete();
      await this.repository.delete(message);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Impossible de supprimer le message');
    }
  }
}
