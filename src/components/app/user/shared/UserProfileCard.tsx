'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatMemberSince } from '@/lib/date';
import { User } from 'lucide-react';
import Image from 'next/image';

interface UserProfileCardProps {
  name: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt?: Date | string;
  isPreview?: boolean;
}

export function UserProfileCard({
  name,
  avatar,
  bio,
  createdAt,
  isPreview = false,
}: UserProfileCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardContent className="flex items-start gap-6 py-8">
        {avatar ? (
          <Image
            src={avatar}
            alt={name || 'Avatar utilisateur'}
            width={96}
            height={96}
            className="rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white border-2 border-white/20">
            {name ? (
              <span className="text-3xl font-bold">
                {name[0].toUpperCase()}
              </span>
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">
              {name || 'Utilisateur'}
            </h1>
            {isPreview && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Aperçu
              </span>
            )}
          </div>
          {bio && <p className="text-white/70 text-base">{bio}</p>}
          {createdAt && (
            <p className="text-white/50 text-sm">
              Membre{' '}
              {formatMemberSince(
                typeof createdAt === 'string' ? new Date(createdAt) : createdAt
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
