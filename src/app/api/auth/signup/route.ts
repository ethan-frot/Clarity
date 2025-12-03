/**
 * POST /api/auth/signup - Inscription utilisateur (US-9)
 *
 * Hybride Better Auth + Clean Architecture :
 * 1. RegisterUserUseCase gère la logique métier et validation
 * 2. Better Auth crée la session automatiquement après inscription
 *
 * Status : 201 Created | 400 Bad Request | 409 Conflict
 */
import { NextRequest } from 'next/server';
import { RegisterUserUseCase } from '@/module/user/registerUser/RegisterUserUseCase';
import { RegisterUserPrismaRepository } from '@/module/user/registerUser/RegisterUserPrismaRepository';
import { auth } from '@/lib/auth/better-auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return Response.json(
        { error: "L'email et le mot de passe sont requis" },
        { status: 400 }
      );
    }

    const repository = new RegisterUserPrismaRepository();
    const useCase = new RegisterUserUseCase(repository);

    const result = await useCase.execute({
      email,
      password,
      name,
    });

    // Créer une session Better Auth après inscription réussie
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    return Response.json(
      {
        message: 'Compte créé avec succès',
        user: {
          id: result.userId,
          email: result.email,
          name: result.name ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);

    if (error instanceof Error) {
      if (error.message.includes('déjà utilisé')) {
        return Response.json({ error: error.message }, { status: 409 });
      }

      if (
        error.message.includes('email') ||
        error.message.includes('mot de passe') ||
        error.message.includes('nom')
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
