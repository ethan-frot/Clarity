'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GradientButton } from '@/components/app/common/GradientButton';
import { IconTextarea } from '@/components/app/common/IconTextarea';
import { createMessage } from '@/services/message/message.service';

interface CreateMessageFormProps {
  conversationId: string;
}

interface FormData {
  content: string;
}

export function CreateMessageForm({ conversationId }: CreateMessageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      toast.success('Message publié avec succès');
      reset();
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    createMutation.mutate({
      content: data.content,
      conversationId,
    });
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Répondre à cette conversation
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <IconTextarea
            id="content"
            label="Votre message"
            icon={MessageSquare}
            placeholder="Écrivez votre réponse..."
            rows={4}
            error={errors.content?.message}
            disabled={isLoading}
            {...register('content', {
              required: 'Le contenu est requis',
              minLength: {
                value: 1,
                message: 'Le contenu doit contenir au moins 1 caractère',
              },
              maxLength: {
                value: 2000,
                message: 'Le contenu ne peut pas dépasser 2000 caractères',
              },
            })}
          />

          <GradientButton
            type="submit"
            isLoading={isLoading}
            loadingText="Publication en cours..."
          >
            Publier ma réponse
          </GradientButton>
        </form>
      </CardContent>
    </Card>
  );
}
