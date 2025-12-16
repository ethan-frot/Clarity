'use client';

import { useSession } from '@/lib/auth/auth-client';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPending } = useSession();

  // Middleware garantit l'authentification (redirection serveur si pas de session)
  // On garde juste le loading state pour UX fluide
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return <>{children}</>;
}
