'use client';

import FloatingLines from '@/components/app/common/FloatingLines';

/**
 * BackgroundLayout - Layout global pour le background animé
 *
 * Ce composant wrap le FloatingLines de reactbits.dev pour l'afficher
 * en arrière-plan sur toutes les pages de l'application.
 *
 * Le background est en position absolute avec z-index bas pour être
 * derrière tout le contenu.
 */
export function BackgroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background animé avec FloatingLines (Three.js) */}
      <div className="fixed inset-0 z-0">
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={5}
          lineDistance={5}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* Content avec z-index supérieur */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
