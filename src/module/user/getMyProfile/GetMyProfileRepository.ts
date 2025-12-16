import { UserProfileDTO } from './types/getMyProfile.types';

export interface GetMyProfileRepository {
  findByIdForProfile(userId: string): Promise<UserProfileDTO>;
}
