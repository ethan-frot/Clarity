export interface UpdateUserProfileCommand {
  userId: string;
  name?: string | null;
  bio?: string | null;
  avatar?: File | null;
}

export interface UpdateUserProfileResult {
  success: boolean;
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    avatar: string | null;
    updatedAt: Date;
  };
}

export const AVATAR_VALIDATION = {
  maxSize: 2 * 1024 * 1024,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;
