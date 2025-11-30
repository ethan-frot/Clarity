'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ArrowLeft, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCard } from './MessageCard';
import { UpdateConversationTitleDialog } from '@/module/conversation/updateConversation/ui/UpdateConversationTitleDialog';
import { DeleteConversationDialog } from '@/module/conversation/deleteConversation/ui/DeleteConversationDialog';
import { fetchConversationById } from '@/services/conversation/conversation.service';
import { getRelativeTime } from '@/lib/date';

interface ConversationDetailProps {
  conversationId: string;
}

export function ConversationDetail({
  conversationId,
}: ConversationDetailProps) {
  const { data: session } = useSession();

  const {
    data: conversation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversationById(conversationId),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-red-400 text-lg">
              {error instanceof Error
                ? error.message
                : 'Conversation introuvable'}
            </p>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 mt-4 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux conversations
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  const authorDisplayName =
    conversation.author.name || conversation.author.email;
  const createdDate = new Date(conversation.createdAt);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux conversations
      </Link>

      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
        <CardHeader className="relative">
          {session?.user?.id === conversation.authorId && (
            <div className="absolute right-4 flex items-center gap-2">
              <UpdateConversationTitleDialog
                conversationId={conversationId}
                currentTitle={conversation.title}
              />
              <DeleteConversationDialog
                conversationId={conversationId}
                conversationTitle={conversation.title}
              />
            </div>
          )}

          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
              {authorDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 mb-1">
                {authorDisplayName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="h-3 w-3" />
                <span>{getRelativeTime(createdDate)}</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            {conversation.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-white/50">
            <MessageSquare className="h-4 w-4" />
            <span>
              {conversation.messages.length === 0
                ? 'Aucune réponse'
                : `${conversation.messages.length} réponse${
                    conversation.messages.length > 1 ? 's' : ''
                  }`}
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Réponses
        </h2>

        {conversation.messages.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">
                Aucune réponse pour le moment. Soyez le premier à répondre !
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversation.messages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
