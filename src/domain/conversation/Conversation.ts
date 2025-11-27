/**
 * Entité Conversation - Représente une discussion sur le forum
 *
 * Règles métier :
 * - Titre obligatoire (1-200 caractères)
 * - Auteur obligatoire (authorId)
 * - Soft delete via deletedAt
 */
export class Conversation {
  readonly id?: string;
  readonly authorId: string;
  title: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date | null;

  constructor(props: {
    id?: string;
    title: string;
    authorId: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }) {
    this.validateTitle(props.title);
    this.validateAuthorId(props.authorId);

    this.id = props.id;
    this.title = props.title;
    this.authorId = props.authorId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  updateTitle(newTitle: string): void {
    this.validateTitle(newTitle);
    this.title = newTitle;
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Le titre est requis');
    }
    if (title.length > 200) {
      throw new Error('Le titre ne peut pas dépasser 200 caractères');
    }
  }

  private validateAuthorId(authorId: string): void {
    if (!authorId || authorId.trim().length === 0) {
      throw new Error("L'auteur est requis");
    }
  }
}
