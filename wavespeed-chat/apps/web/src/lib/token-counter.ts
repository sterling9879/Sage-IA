/**
 * Token counter utility for estimating token usage
 * Uses a simple character-based approximation
 */

// Average characters per token varies by language
// Portuguese: ~4 characters per token
// English: ~4 characters per token
// Code: ~3-4 characters per token

const CHARS_PER_TOKEN = {
  text: 4,
  code: 3.5,
} as const;

export function countTokens(text: string, type: keyof typeof CHARS_PER_TOKEN = 'text'): number {
  if (!text) return 0;
  const charsPerToken = CHARS_PER_TOKEN[type];
  return Math.ceil(text.length / charsPerToken);
}

export function estimateCost(
  promptTokens: number,
  completionTokens: number,
  model: string
): number {
  // Cost per 1M tokens in cents (approximate)
  const costs: Record<string, { input: number; output: number }> = {
    // Anthropic
    'anthropic/claude-3.7-sonnet': { input: 300, output: 1500 },
    'anthropic/claude-3.5-sonnet': { input: 300, output: 1500 },
    'anthropic/claude-3-haiku': { input: 25, output: 125 },

    // Google
    'google/gemini-2.5-flash': { input: 15, output: 60 },
    'google/gemini-2.5-pro': { input: 125, output: 500 },
    'google/gemini-2.0-flash-exp:free': { input: 0, output: 0 },

    // OpenAI
    'openai/gpt-4o': { input: 250, output: 1000 },
    'openai/gpt-4.1': { input: 200, output: 800 },
    'openai/gpt-5-chat': { input: 500, output: 1500 },

    // Meta (free tier)
    'meta-llama/llama-3.2-90b-vision-instruct': { input: 90, output: 90 },
    'meta-llama/llama-4-maverick': { input: 50, output: 50 },
    'meta-llama/llama-4-scout': { input: 0, output: 0 },

    // DeepSeek
    'deepseek/deepseek-chat': { input: 14, output: 28 },
    'deepseek/deepseek-r1': { input: 55, output: 219 },
  };

  const modelCost = costs[model] || { input: 100, output: 300 }; // Default cost

  // Calculate cost in cents
  const inputCost = (promptTokens / 1_000_000) * modelCost.input;
  const outputCost = (completionTokens / 1_000_000) * modelCost.output;

  // Return cost in cents, rounded up
  return Math.ceil((inputCost + outputCost) * 100) / 100;
}

export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  return `${(count / 1000).toFixed(1)}K`;
}

export function isWithinLimit(tokenCount: number, maxTokens: number): boolean {
  return tokenCount <= maxTokens;
}

export function getContextWindowSize(model: string): number {
  const contextWindows: Record<string, number> = {
    // Anthropic
    'anthropic/claude-3.7-sonnet': 200000,
    'anthropic/claude-3.5-sonnet': 200000,
    'anthropic/claude-3-haiku': 200000,

    // Google
    'google/gemini-2.5-flash': 1000000,
    'google/gemini-2.5-pro': 1000000,
    'google/gemini-2.0-flash-exp:free': 32000,

    // OpenAI
    'openai/gpt-4o': 128000,
    'openai/gpt-4.1': 128000,
    'openai/gpt-5-chat': 256000,

    // Meta
    'meta-llama/llama-3.2-90b-vision-instruct': 128000,
    'meta-llama/llama-4-maverick': 128000,
    'meta-llama/llama-4-scout': 32000,

    // DeepSeek
    'deepseek/deepseek-chat': 64000,
    'deepseek/deepseek-r1': 64000,
  };

  return contextWindows[model] || 32000; // Default context window
}
