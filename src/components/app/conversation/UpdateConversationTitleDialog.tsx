'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Edit2, FileText } from 'lucide-react';
import { CustomModal } from '@/components/app/common/CustomModal';
import { GradientButton } from '@/components/app/common/GradientButton';
import { IconInput } from '@/components/app/common/IconInput';
import { updateConversationTitle } from '@/services/conversation/conversation.service';

interface UpdateConversationTitleDialogProps {
  conversationId: string;
  currentTitle: string;
}

interface FormData {
  title: string;
}

export function UpdateConversationTitleDialog({
  conversationId,
  currentTitle,
}: UpdateConversationTitleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: currentTitle,
    },
  });

  useEffect(() => {
    reset({ title: currentTitle });
  }, [currentTitle, reset]);

  const mutation = useMutation({
    mutationFn: updateConversationTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Titre modifié avec succès');
      setIsOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    reset({ title: currentTitle });
    setIsOpen(false);
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      conversationId,
      title: data.title,
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
        aria-label="Modifier le titre"
      >
        <Edit2 className="h-4 w-4 text-white/70" />
      </button>

      <CustomModal isOpen={isOpen} onClose={handleClose} maxWidth="600px">
        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Edit2 className="h-6 w-6 text-blue-400" />
              Modifier le titre
            </h2>
            <p className="text-white/70 text-base">
              Modifier le titre de votre conversation.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <IconInput
              id="title"
              label="Titre de la conversation"
              icon={FileText}
              placeholder="Nouveau titre"
              error={errors.title?.message}
              helperText="1 à 200 caractères"
              disabled={mutation.isPending}
              {...register('title', {
                required: 'Le titre est requis',
                minLength: {
                  value: 1,
                  message: 'Le titre doit contenir au moins 1 caractère',
                },
                maxLength: {
                  value: 200,
                  message: 'Le titre ne peut pas dépasser 200 caractères',
                },
              })}
            />

            <div className="pt-4 border-t border-white/10">
              <GradientButton
                type="submit"
                isLoading={mutation.isPending}
                loadingText="Modification..."
                className="w-full"
              >
                Modifier le titre
              </GradientButton>
            </div>
          </form>
        </div>
      </CustomModal>
    </>
  );
}
