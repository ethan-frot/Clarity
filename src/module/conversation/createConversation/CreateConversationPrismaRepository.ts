import { prisma } from '@/lib/prisma';
import { CreateConversationRepository } from './CreateConversationRepository';
import { Conversation } from '@/domain/conversation/Conversation';
import { Message } from '@/domain/message/Message';
import { PrismaClient } from '@/generated/prisma';

/**
 * Implémentation Prisma du repository pour créer une conversation
 *
 * Pattern : Adapter (Hexagonal Architecture)
 * Utilise une transaction Prisma pour garantir l'atomicité
 */
export class CreateConversationPrismaRepository implements CreateConversationRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async save(
    conversation: Conversation,
    firstMessage: Message
  ): Promise<string> {
    const result = await this.prismaClient.conversation.create({
      data: {
        title: conversation.title,
        authorId: conversation.authorId,
        messages: {
          create: {
            content: firstMessage.content,
            authorId: firstMessage.authorId,
          },
        },
      },
    });

    return result.id;
  }
}
