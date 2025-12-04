import { PrismaClient } from '@/generated/prisma';

export async function createTestConversation(
  prisma: PrismaClient,
  userId: string,
  overrides?: {
    title?: string;
    firstMessage?: string;
  }
) {
  return await prisma.conversation.create({
    data: {
      title: overrides?.title || 'Test conversation',
      authorId: userId,
      messages: {
        create: {
          content: overrides?.firstMessage || 'Premier message de test',
          authorId: userId,
        },
      },
    },
  });
}

export async function createTestMessage(
  prisma: PrismaClient,
  conversationId: string,
  userId: string,
  overrides?: {
    content?: string;
  }
) {
  return await prisma.message.create({
    data: {
      content: overrides?.content || 'Message de test',
      conversationId,
      authorId: userId,
    },
  });
}
