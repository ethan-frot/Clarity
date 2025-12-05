import { Conversation } from '@/domain/conversation/Conversation';
import { Conversation as PrismaConversation } from '@/generated/prisma';

export function toConversationDomain(data: PrismaConversation): Conversation {
  return new Conversation({
    id: data.id,
    title: data.title,
    authorId: data.authorId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt ?? data.createdAt,
    deletedAt: data.deletedAt ?? undefined,
  });
}
