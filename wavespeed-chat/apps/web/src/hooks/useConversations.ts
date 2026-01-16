'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Conversation } from '@/types';
import { useUIStore } from '@/stores/ui-store';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToast } = useUIStore();

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/conversations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar conversas');
      }

      setConversations(data.conversations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao excluir conversa');
        }

        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        addToast({
          type: 'success',
          message: 'Conversa excluída',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    },
    [addToast]
  );

  const renameConversation = useCallback(
    async (conversationId: string, newTitle: string) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao renomear conversa');
        }

        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c))
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    },
    [addToast]
  );

  const togglePin = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isPinned: !conversation.isPinned }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao fixar conversa');
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
          )
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    },
    [conversations, addToast]
  );

  const archiveConversation = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isArchived: true }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao arquivar conversa');
        }

        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        addToast({
          type: 'success',
          message: 'Conversa arquivada',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    },
    [addToast]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sort conversations: pinned first, then by date
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return {
    conversations: sortedConversations,
    isLoading,
    error,
    fetchConversations,
    deleteConversation,
    renameConversation,
    togglePin,
    archiveConversation,
  };
}
