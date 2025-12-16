'use client';

import { UpdateProfileForm } from '@/module/user/updateUserProfile/ui/UpdateProfileForm';
import { AvatarUpload } from '@/module/user/updateUserAvatar/ui/AvatarUpload';
import { UpdatePasswordForm } from '@/module/user/updateUserPassword/ui/UpdatePasswordForm';
import { UserProfileCard } from '@/components/app/user/shared/UserProfileCard';
import { useUserProfile } from '@/module/user/hooks/useUserProfile';

/**
 * Page de paramètres du profil utilisateur
 *
 * Architecture : Orchestrateur de 3 use cases indépendants
 * - updateUserProfile (nom, bio)
 * - updateUserAvatar (photo de profil)
 * - updateUserPassword (sécurité)
 */
export default function ProfileSettingsPage() {
  const { data: profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-white/70">Chargement du profil...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-6">
      <div className="max-w-2xl mx-auto">
        <UserProfileCard
          name={profile?.name || null}
          avatar={profile?.avatar || null}
          bio={profile?.bio || null}
        />
      </div>
      <UpdateProfileForm />
      <AvatarUpload />
      <UpdatePasswordForm />
    </div>
  );
}
