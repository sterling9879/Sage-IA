// Provider types
export interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
}

// Model types
export interface Model {
  id: string;
  name: string;
  provider: Provider;
  description?: string;
  maxTokens: number;
  isFree?: boolean;
  capabilities: ('chat' | 'vision' | 'code')[];
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  model?: string;
  createdAt: Date;
  promptTokens?: number;
  completionTokens?: number;
}

export interface Conversation {
  id: string;
  title: string | null;
  model: string;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: 'FREE' | 'PRO' | 'UNLIMITED';
  messagesUsed: number;
  messagesLimit: number;
  defaultModel: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Chat API types
export interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
}

// Analytics types
export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers24h: number;
  totalMessages: number;
  totalConversations: number;
  estimatedCost: number;
}

export interface DailyUsage {
  date: string;
  messages: number;
  tokens: number;
  cost: number;
}

export interface ModelUsage {
  model: string;
  count: number;
  percentage: number;
}

// Plan limits
export interface PlanLimits {
  messagesPerDay: number;
  maxTokensPerMessage: number;
}

export type PlanLimitsConfig = {
  [key in 'FREE' | 'PRO' | 'UNLIMITED']: PlanLimits;
};
