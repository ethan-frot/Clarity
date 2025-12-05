import { UserContributions } from './types/getUserContributions.types';

export interface GetUserContributionsRepository {
  findUserContributions(userId: string): Promise<UserContributions | null>;
}
