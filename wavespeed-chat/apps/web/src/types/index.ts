// Re-export types from shared package
export type {
  Provider,
  Model,
  ChatMessage,
  Conversation,
  User,
  ApiResponse,
  PaginatedResponse,
  ChatRequest,
  ChatResponse,
} from 'shared';

// Additional web-specific types
export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface ConversationWithMessages {
  id: string;
  title: string | null;
  model: string;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageItem[];
}

export interface MessageItem {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  model?: string | null;
  createdAt: Date;
  isEdited: boolean;
}

export interface UserPreferences {
  defaultModel: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
}

export interface ChatState {
  messages: MessageItem[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  model: string;
}

export interface UIState {
  sidebarOpen: boolean;
  modelPickerOpen: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
