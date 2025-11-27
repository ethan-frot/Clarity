/**
 * Entité Message - Représente un message dans une conversation
 *
 * Règles métier :
 * - Contenu obligatoire (1-2000 caractères)
 * - Auteur obligatoire (authorId)
 * - Appartient à une conversation (conversationId)
 * - Soft delete via deletedAt
 */
export class Message {
  readonly id?: string;
  content: string;
  readonly authorId: string;
  readonly conversationId?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly deletedAt?: Date | null;

  constructor(props: {
    id?: string;
    content: string;
    authorId: string;
    conversationId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }) {
    this.validateContent(props.content);
    this.validateAuthorId(props.authorId);

    this.id = props.id;
    this.content = props.content;
    this.authorId = props.authorId;
    this.conversationId = props.conversationId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  updateContent(newContent: string): void {
    this.validateContent(newContent);
    this.content = newContent;
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Le contenu ne peut pas être vide');
    }
    if (content.length > 2000) {
      throw new Error('Le contenu ne peut pas dépasser 2000 caractères');
    }
  }

  private validateAuthorId(authorId: string): void {
    if (!authorId || authorId.trim().length === 0) {
      throw new Error("L'auteur est requis");
    }
  }
}
