'use client';

import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from './ConversationItem';
import { Spinner } from '@/components/ui/Spinner';
import { MessageSquare } from 'lucide-react';

export function ConversationList() {
  const { conversations, isLoading, error } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-sm text-red-500">
        Erro ao carregar conversas
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <MessageSquare className="mb-2 h-8 w-8 text-dark-400" />
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Nenhuma conversa ainda
        </p>
        <p className="text-xs text-dark-400 dark:text-dark-500">
          Comece uma nova conversa
        </p>
      </div>
    );
  }

  // Group conversations by date
  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const recentConversations = conversations.filter((c) => !c.isPinned);

  return (
    <div className="space-y-4 px-2">
      {/* Pinned */}
      {pinnedConversations.length > 0 && (
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-dark-500 dark:text-dark-400">
            Fixadas
          </h3>
          <div className="space-y-1">
            {pinnedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recentConversations.length > 0 && (
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-dark-500 dark:text-dark-400">
            Recentes
          </h3>
          <div className="space-y-1">
            {recentConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
