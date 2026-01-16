import { MODELS, PROVIDERS } from './constants';
import type { Model, Provider } from './types';

/**
 * Get a model by its ID
 */
export function getModelById(id: string): Model | undefined {
  return MODELS.find(m => m.id === id);
}

/**
 * Get all models grouped by provider
 */
export function getModelsByProvider(): Record<string, { provider: Provider; models: Model[] }> {
  return MODELS.reduce((acc, model) => {
    const providerId = model.provider.id;
    if (!acc[providerId]) {
      acc[providerId] = {
        provider: model.provider,
        models: []
      };
    }
    acc[providerId].models.push(model);
    return acc;
  }, {} as Record<string, { provider: Provider; models: Model[] }>);
}

/**
 * Get free models only
 */
export function getFreeModels(): Model[] {
  return MODELS.filter(m => m.isFree);
}

/**
 * Get provider by ID
 */
export function getProviderById(id: string): Provider | undefined {
  return PROVIDERS[id];
}

/**
 * Estimate token count for a text
 * Approximation: 1 token ≈ 4 characters in Portuguese
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('pt-BR');
  } else if (days > 0) {
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  } else if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora mesmo';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate a conversation title from the first message
 */
export function generateConversationTitle(message: string, maxLength = 50): string {
  const cleaned = message.trim().replace(/\n/g, ' ');
  return truncateText(cleaned, maxLength);
}

/**
 * Format number with locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

/**
 * Format currency (BRL)
 */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Class names utility
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
