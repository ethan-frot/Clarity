import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { CreateMessageUseCase } from '@/module/message/createMessage/CreateMessageUseCase';
import { CreateMessagePrismaRepository } from '@/module/message/createMessage/CreateMessagePrismaRepository';

/**
 * POST /api/messages - Créer un message dans une conversation (US-6)
 *
 * Status : 201 Created | 400 Bad Request | 401 Unauthorized | 404 Not Found
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { content, conversationId } = await request.json();

    const repository = new CreateMessagePrismaRepository();
    const useCase = new CreateMessageUseCase(repository);

    const result = await useCase.execute({
      content,
      authorId: session.user.id,
      conversationId,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);

    if (error instanceof Error) {
      if (error.message.includes('conversation')) {
        return Response.json({ error: error.message }, { status: 404 });
      }
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
