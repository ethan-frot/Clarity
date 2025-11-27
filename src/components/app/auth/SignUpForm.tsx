'use client';

// Ce composant est côté client car il utilise React Hook Form (useState, useForm)
// et nécessite des event handlers interactifs (onChange, onSubmit)

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  EmailInput,
  PasswordInput,
  NameInput,
  EMAIL_VALIDATION,
  PASSWORD_VALIDATION,
  NAME_VALIDATION
} from '@/components/app/common/form';
import { GradientButton } from '@/components/app/common/GradientButton';

interface SignUpFormData {
  email: string;
  password: string;
  name?: string;
}

/**
 * Formulaire d'inscription (US-9)
 *
 * Permet à un utilisateur de créer un nouveau compte.
 * Après inscription réussie, redirige vers la page de connexion.
 *
 * Validation :
 * - Email : format RFC 5322, max 255 caractères
 * - Password : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial
 * - Name : optionnel, max 100 caractères
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Erreur serveur (400, 409, 500)
        toast.error(result.error || 'Une erreur est survenue');
        return;
      }

      // Succès
      toast.success('Compte créé avec succès');

      // Redirection différée pour laisser le temps à l'utilisateur de lire le toast
      // UX : 1.5s est suffisant pour confirmer l'action sans ralentir le flow
      setTimeout(() => {
        router.push('/signin');
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Champ Name (optionnel) */}
      <NameInput
        error={errors.name?.message}
        disabled={isLoading}
        optional
        {...register('name', NAME_VALIDATION)}
      />

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
        {...register('password', PASSWORD_VALIDATION)}
      />

      {/* Bouton Submit */}
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
