import { prisma } from '@/lib/prisma';
import { UpdateMessageRepository } from './UpdateMessageRepository';
import { Message } from '@/domain/message/Message';
import { PrismaClient } from '@/generated/prisma';
import { MessageReader } from '../shared/MessageReader';

export class UpdateMessagePrismaRepository implements UpdateMessageRepository {
  private prismaClient: PrismaClient;
  private reader: MessageReader;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
    this.reader = new MessageReader(this.prismaClient);
  }

  async findById(id: string): Promise<Message | null> {
    return this.reader.findById(id);
  }

  async update(message: Message): Promise<void> {
    await this.prismaClient.message.update({
      where: { id: message.id },
      data: {
        content: message.content,
        updatedAt: new Date(),
      },
    });
  }
}
