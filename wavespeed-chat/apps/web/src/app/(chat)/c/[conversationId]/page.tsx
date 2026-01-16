'use client';

import { useEffect } from 'react';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { Spinner } from '@/components/ui/Spinner';

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { loadConversation, isLoading, conversationId } = useChat();

  useEffect(() => {
    if (params.conversationId !== conversationId) {
      loadConversation(params.conversationId);
    }
  }, [params.conversationId, conversationId, loadConversation]);

  if (isLoading && !conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatArea />
      <ChatInput />
    </div>
  );
}
