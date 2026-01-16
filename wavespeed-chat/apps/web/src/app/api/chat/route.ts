import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { wavespeed } from '@/lib/wavespeed';
import { promptBuilder } from '@/lib/prompt-builder';
import { DEFAULT_SYSTEM_PROMPT } from 'shared';

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { message, conversationId, model } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    // Check user limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        messagesUsed: true,
        messagesLimit: true,
        isBanned: true,
        plan: true,
        defaultModel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Conta suspensa' }, { status: 403 });
    }

    if (user.messagesUsed >= user.messagesLimit && user.plan === 'FREE') {
      return NextResponse.json(
        {
          error: 'Limite de mensagens atingido',
          limit: user.messagesLimit,
          used: user.messagesUsed,
        },
        { status: 429 }
      );
    }

    // Create or use existing conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          model: model || user.defaultModel || 'google/gemini-2.5-flash',
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: { messages: true },
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'USER',
        content: message,
      },
    });

    // Build prompt with history
    const allMessages = [...conversation.messages, userMessage];
    const prompt = promptBuilder.build({
      messages: allMessages,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    });

    // Call WaveSpeed API
    const response = await wavespeed.chat({
      prompt,
      model: model || conversation.model,
      userId,
      conversationId: conversation.id,
    });

    // Save assistant response
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'ASSISTANT',
        content: response.content,
        model: response.model,
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
      },
    });

    // Increment usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        messagesUsed: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      message: {
        id: assistantMessage.id,
        role: 'ASSISTANT',
        content: response.content,
        model: response.model,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
