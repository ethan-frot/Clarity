/**
 * POST /api/conversations - Créer une conversation (US-1)
 *
 * Status : 201 Created | 400 Bad Request | 401 Unauthorized
 */
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { CreateConversationUseCase } from '@/module/conversation/createConversation/CreateConversationUseCase';
import { CreateConversationPrismaRepository } from '@/module/conversation/createConversation/CreateConversationPrismaRepository';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return Response.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
      );
    }

    const repository = new CreateConversationPrismaRepository();
    const useCase = new CreateConversationUseCase(repository);

    const result = await useCase.execute({
      title,
      content,
      authorId: session.user.id,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('titre') ||
        error.message.includes('contenu') ||
        error.message.includes('auteur')
      ) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
