import { prisma } from '@/lib/prisma';
import { DeleteMessageRepository } from './DeleteMessageRepository';
import { Message } from '@/domain/message/Message';
import { PrismaClient } from '@/generated/prisma';
import { MessageReader } from '../shared/MessageReader';

export class DeleteMessagePrismaRepository implements DeleteMessageRepository {
  private prismaClient: PrismaClient;
  private reader: MessageReader;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
    this.reader = new MessageReader(this.prismaClient);
  }

  async findById(id: string): Promise<Message | null> {
    return this.reader.findById(id);
  }

  async delete(message: Message): Promise<void> {
    await this.prismaClient.message.update({
      where: { id: message.id },
      data: { deletedAt: message.deletedAt },
    });
  }
}
