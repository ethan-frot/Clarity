import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@/generated/prisma';
import { ListConversationsRepository } from './ListConversationsRepository';
import { ConversationWithCount } from './types/listConversations.types';
import { Conversation } from '@/domain/conversation/Conversation';

export class ListConversationsPrismaRepository implements ListConversationsRepository {
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
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            authorId: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
        author: {
          id: conv.author.id,
          name: conv.author.name,
          email: conv.author.email,
        },
        lastMessage: conv.messages[0]
          ? {
              id: conv.messages[0].id,
              content: conv.messages[0].content,
              authorId: conv.messages[0].authorId,
              createdAt: conv.messages[0].createdAt,
            }
          : undefined,
      } as ConversationWithCount;
    });
  }
}
