import { z } from 'zod';

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Prendre le premier message d'erreur (plus lisible pour l'utilisateur)
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError.message,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
