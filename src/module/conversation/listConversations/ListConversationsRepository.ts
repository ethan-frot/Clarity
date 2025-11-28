import { ConversationWithCount } from './types/listConversations.types';

/**
 * Repository pour le use case ListConversations
 *
 * Pattern : Port (Hexagonal Architecture)
 */
export interface ListConversationsRepository {
  findAll(): Promise<ConversationWithCount[]>;
}
