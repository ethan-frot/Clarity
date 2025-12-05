import { UserContributions } from '@/module/user/getUserContributions/types/getUserContributions.types';

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
