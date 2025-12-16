'use client';

import { PublicUserInfo } from '../types/getUserContributions.types';
import { UserProfileCard } from '@/components/app/user/shared/UserProfileCard';

interface UserProfileHeaderProps {
  user: PublicUserInfo;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <UserProfileCard
      name={user.name}
      avatar={user.avatar}
      bio={user.bio}
      createdAt={user.createdAt}
    />
  );
}
