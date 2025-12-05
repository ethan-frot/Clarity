'use client';

import Link from 'next/link';

interface UserLinkProps {
  userId: string;
  userName: string | null;
  userEmail?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function UserLink({
  userId,
  userName,
  userEmail,
  size = 'md',
  showName = true,
}: UserLinkProps) {
  const displayName = userName || userEmail || 'Utilisateur';
  const initial = displayName.charAt(0).toUpperCase();

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  return (
    <Link
      href={`/users/${userId}/contributions`}
      className="inline-flex items-center gap-3 group hover:opacity-80 transition-opacity"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 group-hover:scale-110 transition-transform duration-200`}
      >
        {initial}
      </div>
      {showName && (
        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
          {displayName}
        </span>
      )}
    </Link>
  );
}
