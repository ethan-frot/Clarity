import { ConversationDetail } from '@/components/app/conversation/ConversationDetail';

interface ConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { id } = await params;
  return <ConversationDetail conversationId={id} />;
}
