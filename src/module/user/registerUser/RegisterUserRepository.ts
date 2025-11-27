import { User } from '@/domain/user/User';

export interface RegisterUserRepository {
  save(user: User): Promise<string>;
  emailExists(email: string): Promise<boolean>;
}
