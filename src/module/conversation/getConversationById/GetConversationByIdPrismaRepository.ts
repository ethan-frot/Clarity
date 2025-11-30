import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@/generated/prisma';
import { GetConversationByIdRepository } from './GetConversationByIdRepository';
import { ConversationWithMessages } from './types/getConversationById.types';

export class GetConversationByIdPrismaRepository implements GetConversationByIdRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findById(id: string): Promise<ConversationWithMessages | null> {
    const conversation = await this.prismaClient.conversation.findUnique({
      where: {
        id,
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
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id,
      title: conversation.title,
      authorId: conversation.authorId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt || conversation.createdAt,
      author: {
        id: conversation.author.id,
        name: conversation.author.name,
        email: conversation.author.email,
      },
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        authorId: msg.authorId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt || msg.createdAt,
        author: {
          id: msg.author.id,
          name: msg.author.name,
          email: msg.author.email,
        },
      })),
    };
  }
}
