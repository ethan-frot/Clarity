'use client';

// Ce composant est côté client car il utilise React Hook Form (useState, useForm)
// et nécessite des event handlers interactifs (onChange, onSubmit)

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import {
  EmailInput,
  PasswordInput,
  EMAIL_VALIDATION,
} from '@/components/app/common/form';
import { GradientButton } from '@/components/app/common/GradientButton';

interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Formulaire de connexion (US-10)
 *
 * Permet à un utilisateur de se connecter avec son email et mot de passe.
 *
 * Architecture NextAuth :
 * 1. Ce composant client appelle signIn('credentials', {...}) de next-auth/react
 * 2. NextAuth envoie les credentials au Credentials Provider (@/lib/auth.ts)
 * 3. Le provider exécute SignInUseCase pour valider les credentials
 * 4. Si succès : NextAuth crée une session JWT + cookie httpOnly
 * 5. Si échec : NextAuth retourne { error: 'CredentialsSignin', ok: false }
 *
 * Gestion des erreurs :
 * - result.error : Credentials invalides (email ou password incorrect)
 * - !result.ok : Erreur technique (serveur, réseau, etc.)
 *
 * Sécurité :
 * - Message d'erreur volontairement vague pour éviter l'énumération d'emails
 * - Session stockée dans cookie httpOnly (protection XSS)
 * - Cookie sécurisé (HTTPS only en production)
 */
export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();

  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '/';
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/';
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      // Appel du provider NextAuth Credentials
      // redirect: false permet de gérer manuellement la redirection et d'afficher des toasts
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      // Cas 1 : Credentials invalides (email ou password incorrect)
      // NextAuth retourne { error: 'CredentialsSignin' } si le provider rejette
      if (result?.error) {
        // Sécurité : Message volontairement vague pour ne pas révéler si l'email existe
        toast.error('Email ou mot de passe incorrect');
        return;
      }

      // Cas 2 : Erreur technique (serveur inaccessible, erreur réseau, etc.)
      // ok devrait être true si la connexion a réussi
      if (!result?.ok) {
        toast.error('Une erreur est survenue lors de la connexion');
        return;
      }

      // Cas 3 : Succès - Session créée par NextAuth (cookie httpOnly + JWT)
      toast.success('Connexion réussie');

      // Redirection différée pour laisser le temps à l'utilisateur de lire le toast
      // router.refresh() est nécessaire pour forcer Next.js à refetch les composants serveur
      // avec la nouvelle session (notamment pour mettre à jour le navbar)
      const redirectUrl = getRedirectUrl();
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Champ Email */}
      <EmailInput
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email', EMAIL_VALIDATION)}
      />

      {/* Champ Password */}
      <PasswordInput
        error={errors.password?.message}
        disabled={isLoading}
        {...register('password', {
          required: 'Le mot de passe est requis',
        })}
      />

      {/* Bouton Submit */}
      <GradientButton
        type="submit"
        isLoading={isLoading}
        loadingText="Connexion en cours..."
      >
        Se connecter
      </GradientButton>
    </form>
  );
}
