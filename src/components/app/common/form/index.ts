/**
 * Centralise tous les exports du dossier form pour simplifier les imports (au lieu d'importer depuis plusieurs fichiers, on importe tout depuis ici)
 */

// Composants
export { EmailInput } from './EmailInput';
export { PasswordInput } from './PasswordInput';
export { NameInput } from './NameInput';

// Règles de validation
export { EMAIL_VALIDATION, PASSWORD_VALIDATION, NAME_VALIDATION } from './validation';
