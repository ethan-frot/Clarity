export interface UpdateUserAvatarCommand {
  userId: string;
  file: Buffer;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const AVATAR_VALIDATION = {
  maxSize: 2 * 1024 * 1024, // 2 MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;
