import { prisma } from './prisma';

interface ChatOptions {
  prompt: string;
  model: string;
  userId: string;
  conversationId?: string;
}

interface ChatResponse {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  responseTime: number;
}

export class WaveSpeedService {
  private baseUrl = 'https://api.wavespeed.ai/api/v3';

  private async getApiKey(): Promise<string> {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        provider: 'wavespeed',
        isActive: true,
      },
    });

    if (!apiKey) {
      throw new Error('API Key do WaveSpeed não configurada');
    }

    // TODO: Decrypt the key if encrypted
    return apiKey.key;
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const startTime = Date.now();
    const apiKey = await this.getApiKey();

    try {
      const response = await fetch(`${this.baseUrl}/wavespeed-ai/any-llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: options.prompt,
          model: options.model,
          enable_sync_mode: true,
          priority: 'latency',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Erro na API WaveSpeed: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Token estimation (approximately 4 characters per token for Portuguese)
      const promptTokens = Math.ceil(options.prompt.length / 4);
      const completionTokens = Math.ceil((data.output?.length || 0) / 4);

      // Log usage
      await this.logUsage({
        userId: options.userId,
        conversationId: options.conversationId,
        model: options.model,
        promptTokens,
        completionTokens,
        responseTime,
        success: true,
      });

      return {
        content: data.output || '',
        model: options.model,
        promptTokens,
        completionTokens,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log error
      await this.logUsage({
        userId: options.userId,
        conversationId: options.conversationId,
        model: options.model,
        promptTokens: 0,
        completionTokens: 0,
        responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      });

      throw error;
    }
  }

  private async logUsage(data: {
    userId: string;
    conversationId?: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    responseTime: number;
    success: boolean;
    errorMessage?: string;
  }) {
    try {
      await prisma.usageLog.create({
        data: {
          userId: data.userId,
          conversationId: data.conversationId,
          model: data.model,
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          totalTokens: data.promptTokens + data.completionTokens,
          responseTime: data.responseTime,
          success: data.success,
          errorMessage: data.errorMessage,
        },
      });
    } catch (error) {
      console.error('Failed to log usage:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const wavespeed = new WaveSpeedService();
