'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, FileText } from 'lucide-react';
import { GradientButton } from '@/components/app/common/GradientButton';
import { IconInput } from '@/components/app/common/IconInput';
import { IconTextarea } from '@/components/app/common/IconTextarea';
import { updateProfile } from '@/services/user.service';
import { useSession } from '@/lib/auth/auth-client';

interface UpdateProfileFormData {
  name: string;
  bio: string;
}

export function UpdateProfileForm() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    defaultValues: {
      name: session?.user?.name || '',
      bio: '', // TODO: Récupérer depuis l'API quand endpoint GET disponible
    },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsLoading(true);

    try {
      await updateProfile({
        name: data.name.trim() || null,
        bio: data.bio.trim() || null,
      });

      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la mise à jour'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="space-y-3 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="h-6 w-6 text-blue-400" />
            Informations du profil
          </h2>
          <p className="text-white/70 text-base">
            Modifiez votre nom et votre biographie
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <IconInput
            id="name"
            label="Nom"
            icon={User}
            placeholder="Votre nom (optionnel)"
            error={errors.name?.message}
            helperText="Maximum 100 caractères"
            disabled={isLoading}
            {...register('name', {
              maxLength: {
                value: 100,
                message: 'Le nom ne peut pas dépasser 100 caractères',
              },
            })}
          />

          <IconTextarea
            id="bio"
            label="Biographie"
            icon={FileText}
            placeholder="Parlez-nous de vous... (optionnel)"
            rows={5}
            error={errors.bio?.message}
            helperText="Maximum 500 caractères"
            disabled={isLoading}
            {...register('bio', {
              maxLength: {
                value: 500,
                message: 'La bio ne peut pas dépasser 500 caractères',
              },
            })}
          />

          <div className="pt-4 border-t border-white/10">
            <GradientButton
              type="submit"
              isLoading={isLoading}
              loadingText="Mise à jour..."
              className="w-full"
            >
              Enregistrer les modifications
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}
