import {
  ConversationWithCount,
  ListConversationsRepository,
} from './ListConversationsRepository';

/**
 * Use Case : Lister toutes les conversations (US-2)
 */
export interface ListConversationsResult {
  conversations: ConversationWithCount[];
}

export class ListConversationsUseCase {
  constructor(private repository: ListConversationsRepository) {}

  async execute(): Promise<ListConversationsResult> {
    try {
      const conversations = await this.repository.findAll();
      return { conversations };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Impossible de récupérer les conversations: ${error.message}`
        );
      }
      throw error;
    }
  }
}
