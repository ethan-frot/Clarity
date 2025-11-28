interface AuthorInfo {
  id: string;
  name: string | null;
  email: string;
}

interface LastMessage {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface ConversationWithCount {
  id?: string;
  title: string;
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  messageCount: number;
  author: AuthorInfo;
  lastMessage?: LastMessage;
}

interface ListConversationsResponse {
  conversations: ConversationWithCount[];
}

interface CreateConversationInput {
  title?: string;
  content: string;
}

interface CreateConversationResponse {
  conversationId: string;
}

export async function fetchConversations(): Promise<ListConversationsResponse> {
  const response = await fetch('/api/conversations', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors de la récupération des conversations');
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
    throw new Error(errorData.error || 'Erreur lors de la création de la conversation');
  }

  return response.json();
}
