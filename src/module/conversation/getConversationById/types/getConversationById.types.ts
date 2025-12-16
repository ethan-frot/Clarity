export interface AuthorInfo {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface MessageWithAuthor {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorInfo;
}

export interface ConversationWithMessages {
  id: string;
  title: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorInfo;
  messages: MessageWithAuthor[];
}
