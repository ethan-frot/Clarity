'use client';

import { Clock } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { getRelativeTime } from '@/lib/date';
import { UpdateMessageDialog } from '@/module/message/updateMessage/ui/UpdateMessageDialog';
import { DeleteMessageDialog } from '@/module/message/deleteMessage/ui/DeleteMessageDialog';

interface AuthorInfo {
  id: string;
  name: string | null;
  email: string;
}

interface MessageCardProps {
  message: {
    id: string;
    content: string;
    createdAt: string;
    author: AuthorInfo;
  };
  conversationId: string;
}

export function MessageCard({ message, conversationId }: MessageCardProps) {
  const { data: session } = useSession();
  const authorDisplayName = message.author.name || message.author.email;
  const createdDate = new Date(message.createdAt);
  const isAuthor = session?.user?.id === message.author.id;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardContent className="pt-6 relative">
        {isAuthor && (
          <div className="absolute top-4 right-4 flex gap-2">
            <UpdateMessageDialog
              messageId={message.id}
              currentContent={message.content}
              conversationId={conversationId}
            />
            <DeleteMessageDialog
              messageId={message.id}
              messagePreview={message.content}
              conversationId={conversationId}
            />
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
            {authorDisplayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0 space-y-2 pr-20">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-white/90">
                {authorDisplayName}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="h-3 w-3" />
                <span>{getRelativeTime(createdDate)}</span>
              </div>
            </div>

            <p className="text-sm text-white/80 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
