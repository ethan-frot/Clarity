import { prisma } from '@/lib/prisma';
import { DeleteConversationRepository } from './DeleteConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';
import { PrismaClient } from '@/generated/prisma';
import { toConversationDomain } from '../shared/conversationMapper';

export class DeleteConversationPrismaRepository implements DeleteConversationRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findById(id: string): Promise<Conversation | null> {
    const data = await this.prismaClient.conversation.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return toConversationDomain(data);
  }

  async delete(id: string): Promise<void> {
    const now = new Date();

    await this.prismaClient.$transaction([
      this.prismaClient.message.updateMany({
        where: { conversationId: id },
        data: { deletedAt: now },
      }),
      this.prismaClient.conversation.update({
        where: { id },
        data: { deletedAt: now },
      }),
    ]);
  }
}
