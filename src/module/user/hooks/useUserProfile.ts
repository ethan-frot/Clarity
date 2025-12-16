import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '@/services/user.service';

/**
 * Cache de 5min pour éviter de refetch à chaque navigation
 * Le profil change rarement, donc on peut tolérer des données légèrement obsolètes
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
  });
}
