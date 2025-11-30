import { Conversation } from '@/domain/conversation/Conversation';

export interface UpdateConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  update(conversation: Conversation): Promise<void>;
}
