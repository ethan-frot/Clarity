'use client';

import { MessageContribution } from '../types/getUserContributions.types';
import { MessageCard } from './MessageCard';

interface MessageListSectionProps {
  messages: MessageContribution[];
}

export function MessageListSection({ messages }: MessageListSectionProps) {
  if (messages.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Messages postés</h2>
        <p className="text-white/50 text-center py-8">
          Aucun message posté pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">
        Messages postés ({messages.length})
      </h2>
      <div className="grid gap-4">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
