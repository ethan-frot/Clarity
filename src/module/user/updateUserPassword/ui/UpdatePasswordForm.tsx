'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import {
  PasswordInput,
  PASSWORD_VALIDATION,
} from '@/components/app/common/form';
import { GradientButton } from '@/components/app/common/GradientButton';

interface UpdatePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Formulaire de changement de mot de passe (US-15c)
 *
 * Règles métier :
 * - Ancien mot de passe obligatoire pour vérification
 * - Nouveau mot de passe : min 8 caractères, 1 maj, 1 min, 1 chiffre, 1 caractère spécial
 * - Confirmation doit matcher le nouveau mot de passe
 * - Après succès : toutes les sessions invalidées + déconnexion automatique
 */
export function UpdatePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);

    try {
      // TODO: Appel API réel à implémenter
      const response = await fetch('/api/users/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors du changement de mot de passe');
        return;
      }

      toast.success('Mot de passe modifié avec succès. Redirection...');

      // Rediriger vers la page de connexion après 1.5 secondes (l'utilisateur est déconnecté)
      setTimeout(() => {
        router.push('/sign-in?redirect=/settings');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="space-y-3 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Lock className="h-6 w-6 text-blue-400" />
            Sécurité
          </h2>
          <p className="text-white/70 text-base">
            Modifiez votre mot de passe. Vous serez déconnecté après la
            modification.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <PasswordInput
            id="oldPassword"
            label="Ancien mot de passe"
            error={errors.oldPassword?.message}
            disabled={isLoading}
            showHelperText={false}
            {...register('oldPassword', {
              required: "L'ancien mot de passe est requis",
            })}
          />

          <PasswordInput
            id="newPassword"
            label="Nouveau mot de passe"
            error={errors.newPassword?.message}
            disabled={isLoading}
            showHelperText={true}
            {...register('newPassword', PASSWORD_VALIDATION)}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            error={errors.confirmPassword?.message}
            disabled={isLoading}
            showHelperText={false}
            placeholder="Retapez le nouveau mot de passe"
            {...register('confirmPassword', {
              required: 'La confirmation est requise',
              validate: (value) =>
                value === newPassword ||
                'Les mots de passe ne correspondent pas',
            })}
          />

          <GradientButton
            type="submit"
            isLoading={isLoading}
            loadingText="Modification en cours..."
          >
            Modifier le mot de passe
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
