import { create } from 'zustand';
import type { MessageItem } from '@/types';
import { DEFAULT_MODEL } from '@/constants/models';

interface ChatStore {
  // State
  messages: MessageItem[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  conversationId: string | null;
  model: string;

  // Actions
  setMessages: (messages: MessageItem[]) => void;
  addMessage: (message: MessageItem) => void;
  updateMessage: (id: string, content: string) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setLoading: (isLoading: boolean) => void;
  setStreaming: (isStreaming: boolean) => void;
  setError: (error: string | null) => void;
  setConversationId: (id: string | null) => void;
  setModel: (model: string) => void;
  reset: () => void;
}

const initialState = {
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  conversationId: null,
  model: DEFAULT_MODEL,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (isLoading) => set({ isLoading }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setError: (error) => set({ error }),

  setConversationId: (conversationId) => set({ conversationId }),

  setModel: (model) => set({ model }),

  reset: () => set(initialState),
}));
