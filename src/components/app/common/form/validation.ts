/**
 * Règles de validation métier pour les formulaires
 * Ces règles sont centralisées pour garantir la cohérence à travers l'application
 */

/**
 * Validation pour le champ email
 * - Requis
 * - Format email valide
 * - Maximum 255 caractères
 */
export const EMAIL_VALIDATION = {
  required: 'L\'email est requis',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Format d\'email invalide',
  },
  maxLength: {
    value: 255,
    message: 'L\'email ne peut pas dépasser 255 caractères',
  },
} as const;

/**
 * Validation pour le champ mot de passe
 * - Requis
 * - Minimum 8 caractères
 * - Au moins une majuscule
 * - Au moins une minuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial
 */
export const PASSWORD_VALIDATION = {
  required: 'Le mot de passe est requis',
  minLength: {
    value: 8,
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  },
  validate: {
    hasUppercase: (value: string) =>
      /[A-Z]/.test(value) || 'Doit contenir au moins une majuscule',
    hasLowercase: (value: string) =>
      /[a-z]/.test(value) || 'Doit contenir au moins une minuscule',
    hasNumber: (value: string) =>
      /[0-9]/.test(value) || 'Doit contenir au moins un chiffre',
    hasSpecial: (value: string) =>
      /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value) ||
      'Doit contenir au moins un caractère spécial',
  },
} as const;

/**
 * Validation pour le champ nom
 * - Maximum 100 caractères
 */
export const NAME_VALIDATION = {
  maxLength: {
    value: 100,
    message: 'Le nom ne peut pas dépasser 100 caractères',
  },
} as const;
