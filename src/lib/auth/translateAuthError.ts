/**
 * Traduit les messages d'erreur de Better Auth en français
 */
export function translateAuthError(errorMessage?: string): string {
  if (!errorMessage) return 'Une erreur est survenue';

  const lowerMessage = errorMessage.toLowerCase();

  if (
    lowerMessage.includes('already exists') ||
    lowerMessage.includes('email already') ||
    lowerMessage.includes('user already')
  ) {
    return 'Cette adresse email est déjà utilisée';
  }

  if (
    lowerMessage.includes('not verified') ||
    lowerMessage.includes('verify your email') ||
    lowerMessage.includes('email verification')
  ) {
    return 'Vous devez vérifier votre adresse email avant de vous connecter';
  }

  if (
    lowerMessage.includes('invalid credentials') ||
    lowerMessage.includes('incorrect') ||
    lowerMessage.includes('wrong password')
  ) {
    return 'Email ou mot de passe incorrect';
  }

  if (
    lowerMessage.includes('invalid token') ||
    lowerMessage.includes('token expired') ||
    lowerMessage.includes('token not found')
  ) {
    return 'Token invalide, expiré ou déjà utilisé. Veuillez faire une nouvelle demande.';
  }

  if (lowerMessage.includes('user not found')) {
    return 'Utilisateur non trouvé';
  }

  return 'Une erreur est survenue';
}
