import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/auth-helpers';
import { UpdateUserProfileUseCase } from '@/module/user/updateUserProfile/UpdateUserProfileUseCase';
import { UpdateUserProfilePrismaRepository } from '@/module/user/updateUserProfile/UpdateUserProfilePrismaRepository';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { name, bio } = await request.json();

    const repository = new UpdateUserProfilePrismaRepository();
    const useCase = new UpdateUserProfileUseCase(repository);

    await useCase.execute({
      userId: session.user.id,
      name,
      bio,
    });

    return Response.json(
      { message: 'Profil mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
