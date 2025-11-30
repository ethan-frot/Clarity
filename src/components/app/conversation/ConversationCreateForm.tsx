'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MessageSquare, FileText, Plus } from 'lucide-react';
import { CustomModal } from '@/components/app/common/CustomModal';
import { GradientButton } from '@/components/app/common/GradientButton';
import { IconInput } from '@/components/app/common/IconInput';
import { IconTextarea } from '@/components/app/common/IconTextarea';
import { createConversation } from '@/services/conversation/conversation.service';

interface ConversationCreateFormData {
  title: string;
  content: string;
}

interface ConversationCreateFormProps {
  onSuccess?: () => void;
}

export function ConversationCreateForm({
  onSuccess,
}: ConversationCreateFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConversationCreateFormData>();

  const handleOpen = () => {
    if (status !== 'loading' && !session) {
      router.push('/signin?reason=create-conversation&redirect=/');
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  const onSubmit = async (data: ConversationCreateFormData) => {
    setIsLoading(true);

    try {
      await createConversation({
        title: data.title,
        content: data.content,
      });

      toast.success('Conversation créée avec succès !');
      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la création'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GradientButton
        size="lg"
        className="w-full sm:w-auto group"
        onClick={handleOpen}
      >
        <Plus className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90 duration-300" />
        Nouvelle conversation
      </GradientButton>

      <CustomModal isOpen={isOpen} onClose={handleClose} maxWidth="650px">
        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              Créer une conversation
            </h2>
            <p className="text-white/70 text-base">
              Posez une question ou lancez une discussion.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <IconInput
              id="title"
              label="Titre de la conversation"
              icon={FileText}
              placeholder="Ex: Comment démarrer avec Next.js 15 ?"
              error={errors.title?.message}
              helperText="1 à 200 caractères"
              disabled={isLoading}
              {...register('title', {
                required: 'Le titre est obligatoire',
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

            <IconTextarea
              id="content"
              label="Premier message"
              icon={MessageSquare}
              placeholder="Décrivez votre question ou sujet de discussion..."
              rows={6}
              error={errors.content?.message}
              helperText="Min 1 caractère, max 2000 caractères"
              disabled={isLoading}
              {...register('content', {
                required: 'Le message est obligatoire',
                minLength: {
                  value: 1,
                  message: 'Le message doit contenir au moins 1 caractère',
                },
                maxLength: {
                  value: 2000,
                  message: 'Le message ne peut pas dépasser 2000 caractères',
                },
              })}
            />

            <div className="pt-4 border-t border-white/10">
              <GradientButton
                type="submit"
                isLoading={isLoading}
                loadingText="Création..."
                className="w-full"
              >
                Créer la conversation
              </GradientButton>
            </div>
          </form>
        </div>
      </CustomModal>
    </>
  );
}
