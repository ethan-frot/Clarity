import { Conversation } from '@/domain/conversation/Conversation';

export interface DeleteConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  delete(id: string): Promise<void>;
}
