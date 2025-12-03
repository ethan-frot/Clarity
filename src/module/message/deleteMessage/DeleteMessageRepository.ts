import { Message } from '@/domain/message/Message';

export interface DeleteMessageRepository {
  findById(id: string): Promise<Message | null>;
  delete(message: Message): Promise<void>;
}
