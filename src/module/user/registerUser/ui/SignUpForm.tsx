'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth/auth-client';
import { translateAuthError } from '@/lib/auth/translateAuthError';
import { toast } from 'sonner';
import {
  EmailInput,
  PasswordInput,
  NameInput,
  EMAIL_VALIDATION,
  PASSWORD_VALIDATION,
  NAME_VALIDATION,
} from '@/components/app/common/form';
import { GradientButton } from '@/components/app/common/GradientButton';

interface SignUpFormData {
  email: string;
  password: string;
  name?: string;
}

/**
 * US-9 + US-17 : Inscription avec vérification email (OTP)
 */
export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name || '',
      });

      if (result.error) {
        toast.error(translateAuthError(result.error.message));
        return;
      }

      toast.success('Compte créé ! Vérifiez votre email pour le code OTP.');

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <NameInput
        error={errors.name?.message}
        disabled={isLoading}
        optional
        {...register('name', NAME_VALIDATION)}
      />

      <EmailInput
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email', EMAIL_VALIDATION)}
      />

      <PasswordInput
        error={errors.password?.message}
        disabled={isLoading}
        {...register('password', PASSWORD_VALIDATION)}
      />

      <GradientButton
        type="submit"
        isLoading={isLoading}
        loadingText="Création en cours..."
      >
        Créer mon compte
      </GradientButton>
    </form>
  );
}
