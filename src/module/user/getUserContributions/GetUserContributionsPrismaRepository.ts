import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@/generated/prisma';
import { GetUserContributionsRepository } from './GetUserContributionsRepository';
import {
  UserContributions,
  PublicUserInfo,
  ConversationContribution,
  MessageContribution,
} from './types/getUserContributions.types';

export class GetUserContributionsPrismaRepository implements GetUserContributionsRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findUserContributions(
    userId: string
  ): Promise<UserContributions | null> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        conversations: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          where: { deletedAt: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            conversationId: true,
            Conversation: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return null;
    }

    const publicUserInfo: PublicUserInfo = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    const conversations: ConversationContribution[] = user.conversations.map(
      (conv) => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt ?? new Date(),
        messageCount: conv._count.messages,
      })
    );

    const messages: MessageContribution[] = user.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt ?? new Date(),
      conversationId: msg.conversationId ?? '',
      conversationTitle: msg.Conversation?.title ?? '',
    }));

    return {
      user: publicUserInfo,
      conversations,
      messages,
    };
  }
}
