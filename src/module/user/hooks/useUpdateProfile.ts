import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/services/user.service';
import { useSession } from '@/lib/auth/auth-client';

interface UpdateProfileData {
  name?: string | null;
  bio?: string | null;
}

/**
 * Invalide les caches TanStack Query après mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user-profile'],
        refetchType: 'all',
      });

      if (session?.user?.id) {
        await queryClient.invalidateQueries({
          queryKey: ['user-contributions', session.user.id],
          refetchType: 'all',
        });
      }
    },
  });
}
