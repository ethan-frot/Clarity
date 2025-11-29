import { GetConversationByIdRepository } from './GetConversationByIdRepository';
import { ConversationWithMessages } from './types/getConversationById.types';

/**
 * Use Case : Récupérer une conversation par ID (US-3)
 *
 * Retourne une conversation avec tous ses messages non supprimés,
 * triés par ordre chronologique.
 */
export class GetConversationByIdUseCase {
  constructor(private repository: GetConversationByIdRepository) {}

  async execute(conversationId: string): Promise<ConversationWithMessages> {
    const conversation = await this.repository.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    return conversation;
  }
}
