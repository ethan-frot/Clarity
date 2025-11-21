import { NextRequest, NextResponse } from "next/server";
import { SignOutUseCase } from "@/module/user/signOut/SignOutUseCase";
import { SignOutPrismaRepository } from "@/module/user/signOut/SignOutPrismaRepository";

/**
 * Déconnecte un utilisateur en révoquant toutes ses sessions actives.
 *
 * Règles métier (US-11) :
 * - Invalide tous les tokens JWT (Access + Refresh) côté serveur
 * - Supprime les cookies de session
 * - Retourne 200 OK même si aucune session n'est active
 *
 * NOTE TEMPORAIRE :
 * Cette implémentation accepte le userId dans le corps de la requête
 * pour les tests. Plus tard, elle sera modifiée pour extraire le userId
 * depuis la session JWT (via NextAuth ou lib/auth.ts).
 *
 * @param request - NextRequest contenant le userId
 * @returns NextResponse avec le résultat de la déconnexion
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parser le corps de la requête
    const body = await request.json();
    const { userId } = body;

    // 2. Validation basique (temporaire - sera remplacée par auth JWT)
    if (!userId) {
      return NextResponse.json(
        { error: "L'identifiant utilisateur est requis" },
        { status: 400 }
      );
    }

    // 3. Instantier les dépendances (simple DI)
    const repository = new SignOutPrismaRepository();
    const useCase = new SignOutUseCase(repository);

    // 4. Exécuter le use case
    const result = await useCase.execute({ userId });

    // 5. Créer la réponse avec suppression des cookies
    const response = NextResponse.json(
      {
        success: result.success,
        message: "Déconnexion réussie",
        revokedSessions: result.revokedSessions,
      },
      { status: 200 }
    );

    // 6. Supprimer les cookies de session
    // Note : Les noms des cookies seront définis lors de l'implémentation JWT complète
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("session");

    return response;
  } catch (error) {
    // 7. Gestion des erreurs
    console.error("Erreur lors de la déconnexion:", error);

    // Erreurs de validation métier
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Erreurs inattendues
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
