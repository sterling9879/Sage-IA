import type { Provider, Model, PlanLimitsConfig } from './types';

export const PROVIDERS: Record<string, Provider> = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '/logos/anthropic.svg',
    color: '#CC785C'
  },
  google: {
    id: 'google',
    name: 'Google',
    logo: '/logos/google.svg',
    color: '#4285F4'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    logo: '/logos/openai.svg',
    color: '#10A37F'
  },
  meta: {
    id: 'meta',
    name: 'Meta',
    logo: '/logos/meta.svg',
    color: '#0668E1'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '/logos/deepseek.svg',
    color: '#5B6EE1'
  }
};

export const MODELS: Model[] = [
  // Anthropic
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: PROVIDERS.anthropic,
    maxTokens: 8192,
    capabilities: ['chat', 'vision', 'code']
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: PROVIDERS.anthropic,
    maxTokens: 8192,
    capabilities: ['chat', 'vision', 'code']
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: PROVIDERS.anthropic,
    maxTokens: 4096,
    isFree: true,
    capabilities: ['chat', 'code']
  },

  // Google
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: PROVIDERS.google,
    maxTokens: 8192,
    capabilities: ['chat', 'vision', 'code']
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: PROVIDERS.google,
    maxTokens: 8192,
    capabilities: ['chat', 'vision', 'code']
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    provider: PROVIDERS.google,
    maxTokens: 4096,
    isFree: true,
    capabilities: ['chat', 'code']
  },

  // OpenAI
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: PROVIDERS.openai,
    maxTokens: 8192,
    capabilities: ['chat', 'vision', 'code']
  },
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: PROVIDERS.openai,
    maxTokens: 8192,
    capabilities: ['chat', 'vision', 'code']
  },
  {
    id: 'openai/gpt-5-chat',
    name: 'GPT-5 Chat',
    provider: PROVIDERS.openai,
    maxTokens: 16384,
    capabilities: ['chat', 'vision', 'code']
  },

  // Meta
  {
    id: 'meta-llama/llama-3.2-90b-vision-instruct',
    name: 'LLaMA 3.2 90B Vision',
    provider: PROVIDERS.meta,
    maxTokens: 8192,
    capabilities: ['chat', 'vision']
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'LLaMA 4 Maverick',
    provider: PROVIDERS.meta,
    maxTokens: 8192,
    capabilities: ['chat', 'code']
  },
  {
    id: 'meta-llama/llama-4-scout',
    name: 'LLaMA 4 Scout',
    provider: PROVIDERS.meta,
    maxTokens: 4096,
    isFree: true,
    capabilities: ['chat']
  },

  // DeepSeek
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: PROVIDERS.deepseek,
    maxTokens: 8192,
    capabilities: ['chat', 'code']
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: PROVIDERS.deepseek,
    maxTokens: 8192,
    capabilities: ['chat', 'code']
  }
];

export const PLAN_LIMITS: PlanLimitsConfig = {
  FREE: {
    messagesPerDay: 50,
    maxTokensPerMessage: 2000
  },
  PRO: {
    messagesPerDay: 500,
    maxTokensPerMessage: 4000
  },
  UNLIMITED: {
    messagesPerDay: -1, // Sem limite
    maxTokensPerMessage: 8000
  }
};

export const DEFAULT_MODEL = 'google/gemini-2.5-flash';
export const DEFAULT_SYSTEM_PROMPT = 'Você é um assistente útil e amigável. Responda em português brasileiro.';
export const MAX_HISTORY_TOKENS = 6000;
