import { prisma } from "@/lib/prisma";
import { UpdateConversationRepository } from "./UpdateConversationRepository";
import { Conversation } from "@/domain/conversation/Conversation";
import { PrismaClient } from "@/generated/prisma";

export class UpdateConversationPrismaRepository
  implements UpdateConversationRepository
{
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
      updatedAt: data.updatedAt ?? undefined,
      deletedAt: data.deletedAt,
    });
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
