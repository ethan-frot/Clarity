/**
 * PATCH /api/messages/:id - Modifier un message (US-7)
 *
 * Status : 200 OK | 400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found
 */
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { UpdateMessageUseCase } from '@/module/message/updateMessage/UpdateMessageUseCase';
import { UpdateMessagePrismaRepository } from '@/module/message/updateMessage/UpdateMessagePrismaRepository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content) {
      return Response.json({ error: 'Le contenu est requis' }, { status: 400 });
    }

    const repository = new UpdateMessagePrismaRepository();
    const useCase = new UpdateMessageUseCase(repository);

    await useCase.execute({
      messageId: params.id,
      userId: session.user.id,
      content,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating message:', error);

    if (error instanceof Error) {
      if (error.message.includes('trouvé')) {
        return Response.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('autorisé')) {
        return Response.json({ error: error.message }, { status: 403 });
      }
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
