/**
 * API Routes /api/conversations/[id]
 *
 * GET - Récupérer une conversation par ID (US-3)
 * PATCH - Modifier le titre d'une conversation (US-4)
 * DELETE - Supprimer une conversation (US-5)
 */
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { GetConversationByIdUseCase } from '@/module/conversation/getConversationById/GetConversationByIdUseCase';
import { GetConversationByIdPrismaRepository } from '@/module/conversation/getConversationById/GetConversationByIdPrismaRepository';
import { UpdateConversationUseCase } from '@/module/conversation/updateConversation/UpdateConversationUseCase';
import { UpdateConversationPrismaRepository } from '@/module/conversation/updateConversation/UpdateConversationPrismaRepository';
import { DeleteConversationUseCase } from '@/module/conversation/deleteConversation/DeleteConversationUseCase';
import { DeleteConversationPrismaRepository } from '@/module/conversation/deleteConversation/DeleteConversationPrismaRepository';

/**
 * GET /api/conversations/[id] (US-3)
 *
 * Status : 200 OK | 404 Not Found | 500 Internal Server Error
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repository = new GetConversationByIdPrismaRepository();
    const useCase = new GetConversationByIdUseCase(repository);

    const result = await useCase.execute(id);

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);

    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        return Response.json({ error: error.message }, { status: 404 });
      }

      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id] (US-4)
 *
 * Status : 200 OK | 400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return Response.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    const repository = new UpdateConversationPrismaRepository();
    const useCase = new UpdateConversationUseCase(repository);

    await useCase.execute({
      conversationId: id,
      newTitle: title,
      userId: session.user.id,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la modification de la conversation:', error);

    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        return Response.json({ error: error.message }, { status: 404 });
      }

      if (error.message.includes('Non autorisé')) {
        return Response.json({ error: error.message }, { status: 403 });
      }

      if (error.message.includes('titre')) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id] (US-5)
 *
 * Status : 200 OK | 401 Unauthorized | 403 Forbidden | 404 Not Found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    const repository = new DeleteConversationPrismaRepository();
    const useCase = new DeleteConversationUseCase(repository);

    await useCase.execute({
      conversationId: id,
      userId: session.user.id,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);

    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        return Response.json({ error: error.message }, { status: 404 });
      }

      if (error.message.includes('autorisé')) {
        return Response.json({ error: error.message }, { status: 403 });
      }

      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
