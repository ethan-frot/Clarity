import { GetUserContributionsUseCase } from '@/module/user/getUserContributions/GetUserContributionsUseCase';
import { GetUserContributionsPrismaRepository } from '@/module/user/getUserContributions/GetUserContributionsPrismaRepository';

/**
 * GET /api/users/:id/contributions - Consulter les contributions d'un utilisateur (US-14)
 *
 * Status : 200 OK | 404 Not Found | 500 Internal Server Error
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const repository = new GetUserContributionsPrismaRepository();
    const useCase = new GetUserContributionsUseCase(repository);

    const contributions = await useCase.execute(id);

    return Response.json(contributions, { status: 200 });
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des contributions utilisateur:',
      error
    );

    if (error instanceof Error) {
      if (error.message.includes('Utilisateur non trouvé')) {
        return Response.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
