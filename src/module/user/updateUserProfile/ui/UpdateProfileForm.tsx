'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, FileText } from 'lucide-react';
import { GradientButton } from '@/components/app/common/GradientButton';
import { IconInput } from '@/components/app/common/IconInput';
import { IconTextarea } from '@/components/app/common/IconTextarea';
import { useUserProfile } from '@/module/user/hooks/useUserProfile';
import { useUpdateProfile } from '@/module/user/hooks/useUpdateProfile';

interface UpdateProfileFormData {
  name: string;
  bio: string;
}

export function UpdateProfileForm() {
  const { data: profile, isLoading: isFetchingProfile } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    defaultValues: {
      name: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync({
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
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-white/70">Chargement du profil...</div>
          </div>
        </div>
      </div>
    );
  }

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
            disabled={updateProfileMutation.isPending}
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
            disabled={updateProfileMutation.isPending}
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
              isLoading={updateProfileMutation.isPending}
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
