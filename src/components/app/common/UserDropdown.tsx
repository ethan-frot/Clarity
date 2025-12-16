'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { GradientButton } from './GradientButton';
import { toast } from 'sonner';

export function UserDropdown() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();

      toast.success('Déconnexion réussie', {
        description: 'Vous avez été déconnecté avec succès',
      });

      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion', {
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  };

  if (isPending) {
    return (
      <div className="w-[120px] h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg animate-pulse" />
    );
  }

  if (!session) {
    return (
      <GradientButton
        size="default"
        onClick={() => router.push('/signin')}
        className="min-w-[120px]"
      >
        Connexion
      </GradientButton>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
        aria-label="Menu utilisateur"
      >
        <User className="w-5 h-5 text-white" />
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-2 min-w-[200px] z-50 shadow-lg shadow-black/20">
          <button
            onClick={() => {
              router.push(`/users/${session.user?.id}/contributions`);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/90 rounded-md transition-all duration-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Mes contributions</span>
          </button>

          <button
            onClick={() => {
              router.push('/settings/profile');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/90 rounded-md transition-all duration-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Paramètres</span>
          </button>

          <div className="border-t border-white/10 my-2" />

          <button
            onClick={() => {
              handleSignOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 rounded-md transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
}
