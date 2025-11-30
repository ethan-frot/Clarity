import { Conversation } from '@/domain/conversation/Conversation';
import { Message } from '@/domain/message/Message';

/**
 * Repository pour la création d'une conversation
 *
 * Pattern : Port (Hexagonal Architecture)
 */
export interface CreateConversationRepository {
  // Transaction atomique : conversation + premier message
  save(conversation: Conversation, firstMessage: Message): Promise<string>;
}
