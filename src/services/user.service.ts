import { UserContributions } from '@/module/user/getUserContributions/types/getUserContributions.types';
import { UserProfileDTO } from '@/module/user/getMyProfile/types/getMyProfile.types';

export async function fetchUserContributions(
  userId: string
): Promise<UserContributions> {
  const response = await fetch(`/api/users/${userId}/contributions`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération');
  }

  return response.json();
}

export async function fetchUserProfile(): Promise<UserProfileDTO> {
  const response = await fetch('/api/users/profile');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du profil');
  }

  return response.json();
}

export async function updateProfile(data: {
  name?: string | null;
  bio?: string | null;
}): Promise<void> {
  const response = await fetch('/api/users/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour');
  }
}
