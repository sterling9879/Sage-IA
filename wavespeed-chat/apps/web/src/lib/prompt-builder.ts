import type { Message } from 'database';

interface BuildPromptOptions {
  messages: Message[];
  systemPrompt?: string;
  maxTokens?: number;
}

export class PromptBuilder {
  private defaultMaxTokens: number;

  constructor(maxTokens = 6000) {
    this.defaultMaxTokens = maxTokens;
  }

  build(options: BuildPromptOptions): string {
    const { messages, systemPrompt } = options;
    const maxTokens = options.maxTokens || this.defaultMaxTokens;

    let prompt = '';
    let currentTokens = 0;

    // System prompt first
    if (systemPrompt) {
      prompt += `Sistema: ${systemPrompt}\n\n`;
      currentTokens += this.estimateTokens(systemPrompt);
    }

    // Get messages from most recent to oldest
    // until reaching the token limit
    const reversedMessages = [...messages].reverse();
    const includedMessages: Message[] = [];

    for (const msg of reversedMessages) {
      const msgTokens = this.estimateTokens(msg.content);
      if (currentTokens + msgTokens > maxTokens) break;
      includedMessages.unshift(msg);
      currentTokens += msgTokens;
    }

    // Format messages
    for (const msg of includedMessages) {
      const role = msg.role === 'USER' ? 'Usuário' : 'Assistente';
      prompt += `${role}: ${msg.content}\n\n`;
    }

    prompt += 'Assistente:';
    return prompt;
  }

  buildOpenAIFormat(options: BuildPromptOptions): Array<{ role: string; content: string }> {
    const { messages, systemPrompt } = options;
    const maxTokens = options.maxTokens || this.defaultMaxTokens;

    const result: Array<{ role: string; content: string }> = [];
    let currentTokens = 0;

    // System prompt first
    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
      currentTokens += this.estimateTokens(systemPrompt);
    }

    // Get messages from most recent to oldest
    const reversedMessages = [...messages].reverse();
    const includedMessages: Message[] = [];

    for (const msg of reversedMessages) {
      const msgTokens = this.estimateTokens(msg.content);
      if (currentTokens + msgTokens > maxTokens) break;
      includedMessages.unshift(msg);
      currentTokens += msgTokens;
    }

    // Format messages
    for (const msg of includedMessages) {
      result.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    return result;
  }

  estimateTokens(text: string): number {
    // Approximation: 1 token ≈ 4 characters in Portuguese
    return Math.ceil(text.length / 4);
  }

  getTokenCount(text: string): number {
    return this.estimateTokens(text);
  }

  getTotalTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => total + this.estimateTokens(msg.content), 0);
  }
}

export const promptBuilder = new PromptBuilder();
