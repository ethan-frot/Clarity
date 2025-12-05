'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { PasswordInput } from '@/components/app/common/form';
import { GradientButton } from '@/components/app/common/GradientButton';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            'Token invalide, expiré ou déjà utilisé. Veuillez faire une nouvelle demande.'
        );
        return;
      }

      toast.success('Mot de passe réinitialisé avec succès !');
      router.push('/signin');
    } catch {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PasswordInput
        placeholder="Nouveau mot de passe"
        error={errors.password?.message}
        disabled={isLoading}
        {...register('password', {
          required: 'Mot de passe requis',
          minLength: {
            value: 8,
            message: 'Le mot de passe doit contenir au moins 8 caractères',
          },
          validate: {
            uppercase: (value) =>
              /[A-Z]/.test(value) ||
              'Le mot de passe doit contenir au moins une majuscule',
            lowercase: (value) =>
              /[a-z]/.test(value) ||
              'Le mot de passe doit contenir au moins une minuscule',
            number: (value) =>
              /\d/.test(value) ||
              'Le mot de passe doit contenir au moins un chiffre',
            special: (value) =>
              /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value) ||
              'Le mot de passe doit contenir au moins un caractère spécial',
          },
        })}
      />

      <PasswordInput
        placeholder="Confirmer le nouveau mot de passe"
        error={errors.confirmPassword?.message}
        disabled={isLoading}
        {...register('confirmPassword', {
          required: 'Confirmation requise',
          validate: (value) =>
            value === password || 'Les mots de passe ne correspondent pas',
        })}
      />

      <GradientButton
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingText="Réinitialisation..."
      >
        Réinitialiser le mot de passe
      </GradientButton>

      <p className="text-xs text-white/40 text-center">
        Après la réinitialisation, vous serez redirigé vers la page de connexion
        pour vous connecter avec votre nouveau mot de passe.
      </p>
    </form>
  );
}
