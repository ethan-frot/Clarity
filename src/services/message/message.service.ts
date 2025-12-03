export async function createMessage(data: {
  content: string;
  conversationId: string;
}): Promise<{ messageId: string }> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du message');
  }

  return response.json();
}

export async function updateMessage(data: {
  messageId: string;
  content: string;
}): Promise<{ success: boolean }> {
  const response = await fetch(`/api/messages/${data.messageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: data.content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du message');
  }

  return response.json();
}

export async function deleteMessage(data: {
  messageId: string;
}): Promise<{ success: boolean }> {
  const response = await fetch(`/api/messages/${data.messageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression du message');
  }

  return response.json();
}
