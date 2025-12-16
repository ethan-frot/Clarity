'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/auth-client';
import { translateAuthError } from '@/lib/auth/translateAuthError';
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
 * US-10 + US-17 : Connexion avec vérification email (OTP)
 *
 * Message d'erreur volontairement vague sauf pour email non vérifié (sécurité)
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
        const errorMessage = translateAuthError(result.error.message);

        if (
          errorMessage.includes('vérifier votre adresse email') ||
          errorMessage.includes('vérifier votre email')
        ) {
          toast.error(errorMessage);
          setTimeout(() => {
            router.push(
              `/verify-email?email=${encodeURIComponent(data.email)}`
            );
          }, 1500);
        } else {
          toast.error(errorMessage);
        }
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <EmailInput
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email', EMAIL_VALIDATION)}
        />

        <PasswordInput
          error={errors.password?.message}
          disabled={isLoading}
          showForgotPasswordLink
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
    </div>
  );
}
