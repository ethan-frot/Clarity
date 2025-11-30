import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SignOutUseCase } from '@/module/user/signOut/SignOutUseCase';
import { SignOutPrismaRepository } from '@/module/user/signOut/SignOutPrismaRepository';

/**
 * Déconnecte un utilisateur en révoquant toutes ses sessions actives.
 *
 * Règles métier (US-11) :
 * - Invalide tous les tokens JWT (Access + Refresh) côté serveur
 * - Révoque les sessions en base de données
 * - Supprime les cookies de session NextAuth
 * - Retourne 200 OK même si aucune session n'est active
 *
 * Cette route doit être appelée AVANT NextAuth.signOut() côté client
 * pour garantir la révocation des sessions en base de données.
 *
 * @returns NextResponse avec le résultat de la déconnexion
 */
export async function POST() {
  try {
    // 1. Récupérer la session NextAuth
    const session = await auth();

    // 2. Si pas de session, retourner succès (déjà déconnecté)
    if (!session?.user?.id) {
      // Créer la réponse quand même pour supprimer les cookies
      const response = NextResponse.json(
        {
          success: true,
          message: 'Déjà déconnecté',
          revokedSessions: 0,
        },
        { status: 200 }
      );

      // Supprimer les cookies NextAuth au cas où ils existeraient
      deleteCookies(response);

      return response;
    }

    // 3. Instantier les dépendances (simple DI)
    const repository = new SignOutPrismaRepository();
    const useCase = new SignOutUseCase(repository);

    // 4. Exécuter le use case (révocation des sessions en DB)
    const result = await useCase.execute({ userId: session.user.id });

    // 5. Créer la réponse avec suppression des cookies
    const response = NextResponse.json(
      {
        success: result.success,
        message: 'Déconnexion réussie',
        revokedSessions: result.revokedSessions,
      },
      { status: 200 }
    );

    // 6. Supprimer les cookies NextAuth
    deleteCookies(response);

    return response;
  } catch (error) {
    // 7. Gestion des erreurs
    console.error('Erreur lors de la déconnexion:', error);

    // Erreurs de validation métier
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Erreurs inattendues
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}

/**
 * Supprime tous les cookies de session NextAuth
 * Gère les différents environnements (dev/prod) et les différents noms de cookies
 */
function deleteCookies(response: NextResponse) {
  // Cookies NextAuth en développement
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('next-auth.callback-url');

  // Cookies NextAuth en production (sécurisés)
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.csrf-token');
  response.cookies.delete('__Secure-next-auth.callback-url');

  // Cookies custom (si utilisés)
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('session');
}
