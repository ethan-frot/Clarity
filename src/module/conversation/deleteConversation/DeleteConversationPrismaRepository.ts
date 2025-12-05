/**
 * Repository Prisma : Suppression de conversation (US-5)
 *
 * Implémente le soft delete en définissant deletedAt
 */
import { prisma } from '@/lib/prisma';
import { DeleteConversationRepository } from './DeleteConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';
import { PrismaClient } from '@/generated/prisma';

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

    return new Conversation({
      id: data.id,
      title: data.title,
      authorId: data.authorId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt || data.createdAt,
      deletedAt: data.deletedAt,
    });
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
