'use client';

import Link from 'next/link';
import { MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getRelativeTime } from '@/lib/date';

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
  const authorDisplayName =
    conversation.author.name || conversation.author.email;
  const createdDate = conversation.createdAt
    ? new Date(conversation.createdAt)
    : null;

  return (
    <Link href={`/conversations/${conversation.id}`} className="block w-full">
      <Card className="w-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 cursor-pointer gap-0">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
                {authorDisplayName.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-white/90 truncate">
                {authorDisplayName}
              </p>
            </div>
            {createdDate && (
              <div className="flex items-center gap-1.5 text-xs text-white/50 shrink-0">
                <Clock className="h-3 w-3" />
                <span>{getRelativeTime(createdDate)}</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white wrap-break-word mt-3">
            {conversation.title}
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
    </Link>
  );
}
