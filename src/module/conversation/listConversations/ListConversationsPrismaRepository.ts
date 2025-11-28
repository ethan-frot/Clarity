import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@/generated/prisma";
import {
  ConversationWithCount,
  ListConversationsRepository,
} from "./ListConversationsRepository";
import { Conversation } from "@/domain/conversation/Conversation";

export class ListConversationsPrismaRepository
  implements ListConversationsRepository
{
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findAll(): Promise<ConversationWithCount[]> {
    const conversations = await this.prismaClient.conversation.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return conversations.map((conv) => {
      const conversationEntity = new Conversation({
        id: conv.id,
        title: conv.title,
        authorId: conv.authorId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt ?? undefined,
        deletedAt: conv.deletedAt ?? undefined,
      });

      return {
        id: conversationEntity.id,
        authorId: conversationEntity.authorId,
        title: conversationEntity.title,
        createdAt: conversationEntity.createdAt,
        updatedAt: conversationEntity.updatedAt,
        deletedAt: conversationEntity.deletedAt,
        updateTitle: conversationEntity.updateTitle.bind(conversationEntity),
        messageCount: conv._count.messages,
      } as ConversationWithCount;
    });
  }
}
