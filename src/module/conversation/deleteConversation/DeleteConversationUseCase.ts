/**
 * Use Case : Supprimer une conversation (US-5)
 */
import { DeleteConversationRepository } from './DeleteConversationRepository';

export interface DeleteConversationCommand {
  conversationId: string;
  userId: string;
}

export class DeleteConversationUseCase {
  constructor(private repository: DeleteConversationRepository) {}

  async execute(command: DeleteConversationCommand): Promise<void> {
    const conversation = await this.repository.findById(command.conversationId);

    if (!conversation || conversation.deletedAt) {
      throw new Error('Conversation non trouvée');
    }

    if (conversation.authorId !== command.userId) {
      throw new Error(
        "Vous n'êtes pas autorisé à supprimer cette conversation"
      );
    }

    await this.repository.delete(command.conversationId);
  }
}
