import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le contenu est requis')
    .max(2000, 'Le contenu ne peut pas dépasser 2000 caractères'),
  conversationId: z.string().min(1, 'ID de conversation requis'),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le contenu est requis')
    .max(2000, 'Le contenu ne peut pas dépasser 2000 caractères'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
