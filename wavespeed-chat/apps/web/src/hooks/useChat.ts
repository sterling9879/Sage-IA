'use client';

import { useCallback, useState } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useUIStore } from '@/stores/ui-store';
import type { MessageItem } from '@/types';
import { generateId } from '@/lib/utils';

interface SendMessageOptions {
  message: string;
  model?: string;
}

export function useChat() {
  const [isSending, setIsSending] = useState(false);

  const {
    messages,
    isLoading,
    error,
    conversationId,
    model,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    setConversationId,
    setModel,
    setMessages,
    reset,
  } = useChatStore();

  const { addToast } = useUIStore();

  const sendMessage = useCallback(
    async ({ message, model: overrideModel }: SendMessageOptions) => {
      if (!message.trim() || isSending) return;

      setIsSending(true);
      setLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: MessageItem = {
        id: generateId(),
        role: 'USER',
        content: message.trim(),
        createdAt: new Date(),
        isEdited: false,
      };
      addMessage(userMessage);

      // Add placeholder for assistant response
      const assistantMessageId = generateId();
      const assistantPlaceholder: MessageItem = {
        id: assistantMessageId,
        role: 'ASSISTANT',
        content: '',
        model: overrideModel || model,
        createdAt: new Date(),
        isEdited: false,
      };
      addMessage(assistantPlaceholder);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.trim(),
            conversationId,
            model: overrideModel || model,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao enviar mensagem');
        }

        // Update assistant message with response
        updateMessage(assistantMessageId, data.message.content);

        // Update conversation ID if new
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        addToast({
          type: 'error',
          message: errorMessage,
        });

        // Remove the placeholder message on error
        useChatStore.getState().removeMessage(assistantMessageId);
      } finally {
        setIsSending(false);
        setLoading(false);
      }
    },
    [
      isSending,
      conversationId,
      model,
      addMessage,
      updateMessage,
      setLoading,
      setError,
      setConversationId,
      addToast,
    ]
  );

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      // Find the previous user message
      let userMessageIndex = messageIndex - 1;
      while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'USER') {
        userMessageIndex--;
      }

      if (userMessageIndex < 0) return;

      const userMessage = messages[userMessageIndex];

      // Remove messages from the assistant message onwards
      const newMessages = messages.slice(0, messageIndex);
      setMessages(newMessages);

      // Resend the user message
      await sendMessage({ message: userMessage.content });
    },
    [messages, setMessages, sendMessage]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      const message = messages[messageIndex];
      if (message.role !== 'USER') return;

      // Update the message
      updateMessage(messageId, newContent);

      // Remove messages after this one
      const newMessages = messages.slice(0, messageIndex + 1);
      setMessages(newMessages);

      // Resend the edited message
      await sendMessage({ message: newContent });
    },
    [messages, updateMessage, setMessages, sendMessage]
  );

  const loadConversation = useCallback(
    async (convId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/conversations/${convId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar conversa');
        }

        setMessages(data.messages || []);
        setConversationId(convId);
        if (data.model) {
          setModel(data.model);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        addToast({
          type: 'error',
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [setMessages, setConversationId, setModel, setLoading, setError, addToast]
  );

  const newChat = useCallback(() => {
    reset();
  }, [reset]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    conversationId,
    model,
    sendMessage,
    regenerateMessage,
    editMessage,
    loadConversation,
    newChat,
    setModel,
  };
}
