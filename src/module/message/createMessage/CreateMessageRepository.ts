import { Message } from '@/domain/message/Message';

export interface CreateMessageRepository {
  findConversationById(conversationId: string): Promise<boolean>;
  save(message: Message): Promise<string>;
}
