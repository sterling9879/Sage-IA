import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const models = await prisma.modelConfig.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        modelId: true,
        displayName: true,
        provider: true,
        isEnabled: true,
        isFree: true,
        maxTokens: true,
      },
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar modelos' },
      { status: 500 }
    );
  }
}
