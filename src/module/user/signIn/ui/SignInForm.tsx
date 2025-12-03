'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/auth-client';
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
 * Architecture Better Auth :
 * 1. Appelle signIn.email() de Better Auth client
 * 2. Better Auth envoie les credentials à /api/auth/sign-in/email
 * 3. Si succès : Session créée (cookie httpOnly)
 *
 * Sécurité :
 * - Message d'erreur volontairement vague (prévention énumération)
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
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error('Email ou mot de passe incorrect');
        return;
      }

      toast.success('Connexion réussie');

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
      <EmailInput
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email', EMAIL_VALIDATION)}
      />

      <PasswordInput
        error={errors.password?.message}
        disabled={isLoading}
        {...register('password', {
          required: 'Le mot de passe est requis',
        })}
      />

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
