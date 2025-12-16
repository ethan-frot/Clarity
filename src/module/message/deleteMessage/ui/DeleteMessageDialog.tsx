'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';
import { CustomModal } from '@/components/app/common/CustomModal';
import { RedButton } from '@/components/app/common/RedButton';
import { deleteMessage } from '@/services/message.service';

interface DeleteMessageDialogProps {
  messageId: string;
  messagePreview: string;
  conversationId: string;
}

export function DeleteMessageDialog({
  messageId,
  messagePreview,
  conversationId,
}: DeleteMessageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      toast.success('Message supprimé avec succès');
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    mutation.mutate({ messageId });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 flex items-center justify-center border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer"
        aria-label="Supprimer le message"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-400" />
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
                Supprimer le message
              </h2>
            </div>
            <p className="text-white/70 text-base">
              Êtes-vous sûr de vouloir supprimer ce message ?
            </p>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/60 text-sm italic whitespace-pre-wrap break-words">
                &quot;{messagePreview}&quot;
              </p>
            </div>
            <p className="text-red-400/80 text-sm">
              Cette action est irréversible.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <RedButton
              type="button"
              onClick={handleDelete}
              isLoading={mutation.isPending}
              loadingText="Suppression..."
            >
              Supprimer
            </RedButton>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
