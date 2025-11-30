import { UpdateConversationRepository } from './UpdateConversationRepository';

/**
 * Use Case : Modifier le titre d'une conversation (US-4)
 */

export interface UpdateConversationCommand {
  conversationId: string;
  newTitle: string;
  userId: string;
}

export interface UpdateConversationResult {
  success: boolean;
}

export class UpdateConversationUseCase {
  constructor(private repository: UpdateConversationRepository) {}

  async execute(
    command: UpdateConversationCommand
  ): Promise<UpdateConversationResult> {
    try {
      const conversation = await this.repository.findById(
        command.conversationId
      );

      if (!conversation) {
        throw new Error('Conversation non trouvée');
      }

      if (conversation.authorId !== command.userId) {
        throw new Error('Non autorisé');
      }

      conversation.updateTitle(command.newTitle);

      await this.repository.update(conversation);

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Impossible de modifier la conversation: ${error.message}`
        );
      }
      throw error;
    }
  }
}
