/**
 * Entité User - Utilisateur du forum
 *
 * Règle métier complexe :
 * - Password : skip validation si hash bcrypt détecté (reconstruction DB)
 */
export class User {
  readonly id?: string;
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly avatar?: string;
  readonly bio?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    id?: string;
    email: string;
    password: string;
    name?: string;
    avatar?: string;
    bio?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateEmail(props.email);
    this.validatePassword(props.password);
    this.validateName(props.name);

    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.name = props.name;
    this.avatar = props.avatar;
    this.bio = props.bio;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error("L'email est requis");
    }

    if (email.length > 255) {
      throw new Error("L'email ne peut pas dépasser 255 caractères");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Le format de l'email est invalide");
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Le mot de passe est requis');
    }

    // Skip validation si hash bcrypt (reconstruction depuis DB)
    const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;
    if (bcryptRegex.test(password)) {
      return;
    }

    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au minimum 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      throw new Error(
        'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)'
      );
    }
  }

  private validateName(name?: string): void {
    if (name && name.length > 100) {
      throw new Error('Le nom ne peut pas dépasser 100 caractères');
    }
  }
}
