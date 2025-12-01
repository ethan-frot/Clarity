import { CreateMessageRepository } from './CreateMessageRepository';
import { Message } from '@/domain/message/Message';

export interface CreateMessageCommand {
  content: string;
  authorId: string;
  conversationId: string;
}

export interface CreateMessageResult {
  messageId: string;
}

export class CreateMessageUseCase {
  constructor(private repository: CreateMessageRepository) {}

  async execute(command: CreateMessageCommand): Promise<CreateMessageResult> {
    try {
      const conversationExists = await this.repository.findConversationById(
        command.conversationId
      );

      if (!conversationExists) {
        throw new Error("La conversation n'existe pas");
      }

      const message = new Message({
        content: command.content,
        authorId: command.authorId,
        conversationId: command.conversationId,
      });

      const messageId = await this.repository.save(message);

      return { messageId };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Impossible de créer le message');
    }
  }
}
