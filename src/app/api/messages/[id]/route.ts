/**
 * PATCH /api/messages/:id - Modifier un message (US-7)
 * DELETE /api/messages/:id - Supprimer un message (US-8)
 *
 * Status : 200 OK | 400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found
 */
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/auth-helpers';
import { UpdateMessageUseCase } from '@/module/message/updateMessage/UpdateMessageUseCase';
import { UpdateMessagePrismaRepository } from '@/module/message/updateMessage/UpdateMessagePrismaRepository';
import { DeleteMessageUseCase } from '@/module/message/deleteMessage/DeleteMessageUseCase';
import { DeleteMessagePrismaRepository } from '@/module/message/deleteMessage/DeleteMessagePrismaRepository';
import { updateMessageSchema, validateRequest } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validation = validateRequest(updateMessageSchema, body);

    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const repository = new UpdateMessagePrismaRepository();
    const useCase = new UpdateMessageUseCase(repository);

    await useCase.execute({
      messageId: id,
      userId: session.user.id,
      content: validation.data.content,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    const repository = new DeleteMessagePrismaRepository();
    const useCase = new DeleteMessageUseCase(repository);

    await useCase.execute({
      messageId: id,
      userId: session.user.id,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting message:', error);

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
