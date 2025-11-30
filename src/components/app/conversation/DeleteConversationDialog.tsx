'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomModal } from '@/components/app/common/CustomModal';
import { GradientButton } from '@/components/app/common/GradientButton';
import { deleteConversation } from '@/services/conversation/conversation.service';

interface DeleteConversationDialogProps {
  conversationId: string;
  conversationTitle: string;
}

export function DeleteConversationDialog({
  conversationId,
  conversationTitle,
}: DeleteConversationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation supprimée avec succès');
      setIsOpen(false);
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    mutation.mutate({ conversationId });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 flex items-center justify-center border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer"
        aria-label="Supprimer la conversation"
      >
        <Trash2 className="h-4 w-4 text-red-400" />
      </button>

      <CustomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="500px"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Supprimer la conversation
              </h2>
            </div>
            <p className="text-white/70 text-base">
              Êtes-vous sûr de vouloir supprimer la conversation{' '}
              <span className="text-white font-medium">
                &quot;{conversationTitle}&quot;
              </span>{' '}
              ?
            </p>
            <p className="text-red-400/80 text-sm">
              Cette action est irréversible. Tous les messages de cette
              conversation seront également supprimés.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <GradientButton
              type="button"
              onClick={handleDelete}
              isLoading={mutation.isPending}
              loadingText="Suppression..."
              className="flex-1 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Supprimer
            </GradientButton>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
