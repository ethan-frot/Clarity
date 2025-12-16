export interface UpdateUserAvatarRepository {
  findById(userId: string): Promise<{ id: string; email: string } | null>;
  updateAvatar(userId: string, avatarUrl: string): Promise<void>;
}
