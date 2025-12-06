import { User } from '@/domain/user/User';

export interface UpdateUserProfileRepository {
  findById(userId: string): Promise<User | null>;
  update(
    userId: string,
    data: { name?: string | null; bio?: string | null }
  ): Promise<void>;
}
