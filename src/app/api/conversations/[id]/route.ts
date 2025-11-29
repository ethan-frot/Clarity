/**
 * GET /api/conversations/[id] (US-3)
 *
 * Accessible sans authentification
 * Status : 200 OK | 404 Not Found | 500 Internal Server Error
 */
import { GetConversationByIdUseCase } from '@/module/conversation/getConversationById/GetConversationByIdUseCase';
import { GetConversationByIdPrismaRepository } from '@/module/conversation/getConversationById/GetConversationByIdPrismaRepository';

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
