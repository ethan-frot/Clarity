import { CreateConversationRepository } from './CreateConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';
import { Message } from '@/domain/conversation/Message';

/**
 * Use Case : Créer une conversation (US-1)
 *
 * Responsabilités :
 * - Valider les données via les entités domain
 * - Créer une conversation avec son premier message
 * - Persister en base via le repository (transaction atomique)
 */

export interface CreateConversationCommand {
  title: string;
  content: string;
  authorId: string;
}

export interface CreateConversationResult {
  conversationId: string;
}

export class CreateConversationUseCase {
  constructor(private repository: CreateConversationRepository) {}

  async execute(
    command: CreateConversationCommand
  ): Promise<CreateConversationResult> {
    try {
      const conversation = new Conversation({
        title: command.title,
        authorId: command.authorId,
      });

      const message = new Message({
        content: command.content,
        authorId: command.authorId,
      });

      const conversationId = await this.repository.save(conversation, message);

      return { conversationId };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Impossible de créer la conversation: ${error.message}`);
      }
      throw error;
    }
  }
}
