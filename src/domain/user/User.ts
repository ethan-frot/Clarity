/**
 * Entité User - Utilisateur du forum
 *
 * Utilisée pour les use cases métier (contributions, profil).
 * L'authentification est gérée par Better Auth.
 */
export class User {
  readonly id?: string;
  readonly email: string;
  readonly name?: string;
  readonly avatar?: string;
  readonly bio?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    id?: string;
    email: string;
    name?: string;
    avatar?: string;
    bio?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateName(props.name);
    this.validateBio(props.bio);

    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.avatar = props.avatar;
    this.bio = props.bio;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  private validateName(name?: string): void {
    if (name && name.length > 100) {
      throw new Error('Le nom ne peut pas dépasser 100 caractères');
    }
  }

  private validateBio(bio?: string): void {
    if (bio && bio.length > 500) {
      throw new Error('La bio ne peut pas dépasser 500 caractères');
    }
  }
}
