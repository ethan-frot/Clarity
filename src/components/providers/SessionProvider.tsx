'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * SessionProvider - Wrapper pour NextAuth SessionProvider
 *
 * Ce composant enveloppe l'application pour fournir le contexte de session
 * à tous les composants enfants. Nécessaire pour utiliser useSession().
 *
 * Configuration :
 * - refetchInterval: 0 pour ne pas refetch automatiquement (on utilise router.refresh() manuellement)
 * - refetchOnWindowFocus: true pour refetch quand l'utilisateur revient sur l'onglet
 *
 * Doit être un composant client ('use client') car NextAuth SessionProvider
 * utilise React Context qui nécessite le client-side rendering.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      {children}
    </NextAuthSessionProvider>
  );
}
