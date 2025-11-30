import { Conversation } from '@/domain/conversation/Conversation';

export interface AuthorInfo {
  id: string;
  name: string | null;
  email: string;
}

export interface LastMessage {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface ConversationWithCount extends Conversation {
  messageCount: number;
  author: AuthorInfo;
  lastMessage?: LastMessage;
}
