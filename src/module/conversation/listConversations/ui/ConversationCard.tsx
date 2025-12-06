'use client';

import Link from 'next/link';
import { MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getRelativeTime } from '@/lib/date';
import { UserLink } from '@/components/app/common/UserLink';

interface AuthorInfo {
  id: string;
  name: string | null;
  email: string;
}

interface LastMessage {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface ConversationCardProps {
  conversation: {
    id?: string;
    title: string;
    createdAt?: string;
    messageCount: number;
    author: AuthorInfo;
    lastMessage?: LastMessage;
  };
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const createdDate = conversation.createdAt
    ? new Date(conversation.createdAt)
    : null;

  return (
    <Card className="w-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 gap-0 relative">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 relative z-10">
            <UserLink
              userId={conversation.author.id}
              userName={conversation.author.name}
              userEmail={conversation.author.email}
            />
          </div>
          {createdDate && (
            <div className="flex items-center gap-1.5 text-xs text-white/50 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{getRelativeTime(createdDate)}</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white wrap-break-word mt-3">
          <Link
            href={`/conversations/${conversation.id}`}
            className="after:absolute after:inset-0 after:z-0"
          >
            {conversation.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        {conversation.lastMessage && (
          <p className="text-sm text-white/60 mb-3 wrap-break-word">
            {conversation.lastMessage.content}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-white/50">
          <MessageSquare className="h-4 w-4" />
          <span>
            {conversation.messageCount === 0
              ? 'Aucune réponse'
              : `${conversation.messageCount} réponse${
                  conversation.messageCount > 1 ? 's' : ''
                }`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
