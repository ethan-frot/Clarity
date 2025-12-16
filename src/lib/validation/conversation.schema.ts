import { z } from 'zod';

export const createConversationWithFirstMessageSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  content: z
    .string()
    .min(1, 'Le contenu est requis')
    .max(2000, 'Le contenu ne peut pas dépasser 2000 caractères'),
});

export const updateConversationSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
});

export type CreateConversationWithFirstMessageInput = z.infer<
  typeof createConversationWithFirstMessageSchema
>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
