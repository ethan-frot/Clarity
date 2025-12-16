'use client';

import { useEffect, useState } from 'react';
import { ConversationCreateForm } from '../../createConversation/ui/ConversationCreateForm';
import { ConversationCard } from './ConversationCard';
import { MessageSquare, Loader2 } from 'lucide-react';
import { fetchConversations } from '@/services/conversation.service';

interface AuthorInfo {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

interface LastMessage {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface ConversationWithCount {
  id?: string;
  title: string;
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  messageCount: number;
  author: AuthorInfo;
  lastMessage?: LastMessage;
}

export function ConversationList() {
  const [conversations, setConversations] = useState<ConversationWithCount[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleConversationCreated = () => {
    loadConversations();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Conversations</h1>
        <p className="text-white/60 mb-6">
          Découvrez les discussions de la communauté
        </p>
        <ConversationCreateForm onSuccess={handleConversationCreated} />
      </div>

      {isLoading ? (
        <div className="bg-white/5 backdrop-blur-sm border-white/10 rounded-lg p-12 text-center">
          <Loader2 className="h-12 w-12 text-white/30 mx-auto mb-4 animate-spin" />
          <p className="text-white/60">Chargement des conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border-white/10 rounded-lg p-12 text-center">
          <MessageSquare className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Aucune conversation pour le moment
          </h2>
          <p className="text-white/60 mb-6">
            Soyez le premier à lancer une discussion !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
