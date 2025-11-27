import { User } from '@/domain/user/User';

export interface SignInRepository {
  findByEmail(email: string): Promise<User | null>;
}
