import { prisma } from '@/lib/prisma';
import { Message } from '@/domain/message/Message';
import { PrismaClient } from '@/generated/prisma';
import { toMessageDomain } from './messageMapper';

export class MessageReader {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findById(id: string): Promise<Message | null> {
    const data = await this.prismaClient.message.findUnique({
      where: { id, deletedAt: null },
    });

    if (!data) return null;

    return toMessageDomain(data);
  }
}
