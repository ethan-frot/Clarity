'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GradientButton } from '@/components/app/common/GradientButton';
import { toast } from 'sonner';
import { signOutUser } from '@/services/auth/auth.service';

/**
 * AuthButton - Bouton d'authentification en haut à droite
 *
 * Affiche :
 * - Bouton "Connexion" si l'utilisateur n'est pas authentifié (redirige vers /signin)
 * - Bouton "Déconnexion" si l'utilisateur est authentifié (US-11) (déconnecte sans redirection)
 *
 * Utilise NextAuth pour gérer la session et la déconnexion.
 * Utilise GradientButton pour respecter la DA du site.
 * Affiche un toast de confirmation pour la déconnexion.
 */
export function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fonction de déconnexion (US-11) - sans redirection et sans reload complet
  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      // 1. Révoquer les sessions en DB et supprimer les cookies NextAuth (via service)
      await signOutUser();

      // 2. Mettre à jour le cache client NextAuth
      await signOut({ redirect: false });

      // 3. Afficher le toast de succès
      toast.success('Déconnexion réussie', {
        description: 'Vous avez été déconnecté avec succès',
      });

      // 4. Forcer le refresh des Server Components pour mettre à jour l'UI
      router.refresh();
    } catch (error) {
      // En cas d'erreur
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion', {
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      // Désactiver le loading après un court délai pour laisser le temps au refresh
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  // Fonction de redirection vers la page de connexion
  const handleSignIn = () => {
    router.push('/signin');
  };

  // Loading state initial
  if (status === 'loading') {
    return (
      <div className="h-10 w-32 animate-pulse rounded-lg bg-linear-to-r from-blue-500/20 to-violet-600/20" />
    );
  }

  // Utilisateur non authentifié
  if (status === 'unauthenticated') {
    return (
      <GradientButton onClick={handleSignIn} size="default" className="w-auto">
        Connexion
      </GradientButton>
    );
  }

  // Utilisateur authentifié
  if (status === 'authenticated' && session?.user) {
    return (
      <GradientButton
        onClick={handleSignOut}
        size="default"
        className="w-auto"
        isLoading={isLoading}
        loadingText="Déconnexion..."
      >
        Déconnexion
      </GradientButton>
    );
  }

  return null;
}
