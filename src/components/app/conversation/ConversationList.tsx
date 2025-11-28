'use client';

import { ConversationCreateForm } from './ConversationCreateForm';
import { MessageSquare } from 'lucide-react';

export function ConversationList() {
  const handleConversationCreated = () => {
    console.log('Conversation créée - TODO: rafraîchir la liste');
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

      <div className="bg-white/5 backdrop-blur-sm border-white/10 rounded-lg p-12 text-center">
        <MessageSquare className="h-16 w-16 text-white/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Aucune conversation pour le moment
        </h2>
        <p className="text-white/60 mb-6">
          Soyez le premier à lancer une discussion !
        </p>
      </div>
    </div>
  );
}
