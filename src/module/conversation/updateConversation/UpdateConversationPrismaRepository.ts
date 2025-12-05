import { prisma } from '@/lib/prisma';
import { UpdateConversationRepository } from './UpdateConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';
import { PrismaClient } from '@/generated/prisma';
import { toConversationDomain } from '../shared/conversationMapper';

export class UpdateConversationPrismaRepository implements UpdateConversationRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findById(id: string): Promise<Conversation | null> {
    const data = await this.prismaClient.conversation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!data) {
      return null;
    }

    return toConversationDomain(data);
  }

  async update(conversation: Conversation): Promise<void> {
    await this.prismaClient.conversation.update({
      where: { id: conversation.id },
      data: {
        title: conversation.title,
      },
    });
  }
}
