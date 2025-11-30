import type { AuthorInfo } from '@/module/conversation/listConversations/types/listConversations.types';

/**
 * Version sérialisée de ConversationWithCount pour le transport JSON
 * Les dates sont converties en strings lors de la sérialisation HTTP
 */
interface ConversationWithCountSerialized {
  id?: string;
  title: string;
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  messageCount: number;
  author: AuthorInfo;
  lastMessage?: {
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
  };
}

interface MessageWithAuthorSerialized {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorInfo;
}

interface ConversationWithMessagesSerialized {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorInfo;
  messages: MessageWithAuthorSerialized[];
}

interface ListConversationsResponse {
  conversations: ConversationWithCountSerialized[];
}

interface CreateConversationInput {
  title?: string;
  content: string;
}

interface CreateConversationResponse {
  conversationId: string;
}

interface UpdateConversationInput {
  conversationId: string;
  title: string;
}

interface UpdateConversationResponse {
  success: boolean;
}

interface DeleteConversationInput {
  conversationId: string;
}

interface DeleteConversationResponse {
  success: boolean;
}

export async function fetchConversations(): Promise<ListConversationsResponse> {
  const response = await fetch('/api/conversations', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Erreur lors de la récupération des conversations'
    );
  }

  return response.json();
}

export async function createConversation(
  data: CreateConversationInput
): Promise<CreateConversationResponse> {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Erreur lors de la création de la conversation'
    );
  }

  return response.json();
}

export async function fetchConversationById(
  id: string
): Promise<ConversationWithMessagesSerialized> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Erreur lors de la récupération de la conversation'
    );
  }

  return response.json();
}

export async function updateConversationTitle(
  data: UpdateConversationInput
): Promise<UpdateConversationResponse> {
  const response = await fetch(`/api/conversations/${data.conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: data.title }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Erreur lors de la mise à jour de la conversation'
    );
  }

  return response.json();
}

export async function deleteConversation(
  data: DeleteConversationInput
): Promise<DeleteConversationResponse> {
  const response = await fetch(`/api/conversations/${data.conversationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Erreur lors de la suppression de la conversation'
    );
  }

  return response.json();
}
