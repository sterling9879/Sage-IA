import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { RecentUsers } from '@/components/dashboard/RecentUsers';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Users, MessageSquare, Zap, DollarSign } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(todayStart);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    totalUsers,
    activeUsers24h,
    totalMessages,
    messagesToday,
    totalConversations,
    usageLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastActiveAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.message.count(),
    prisma.message.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.conversation.count(),
    prisma.usageLog.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { estimatedCost: true },
    }),
  ]);

  const estimatedCostToday = usageLogs.reduce(
    (sum, log) => sum + (log.estimatedCost || 0),
    0
  );

  return {
    totalUsers,
    activeUsers24h,
    totalMessages,
    messagesToday,
    totalConversations,
    estimatedCostToday,
  };
}

async function getRecentUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
    },
  });
}

async function getDailyUsage() {
  const days = 7;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const messages = await prisma.message.count({
      where: {
        createdAt: { gte: dayStart, lt: dayEnd },
      },
    });

    result.push({
      date: dayStart.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      messages,
    });
  }

  return result;
}

export default async function DashboardPage() {
  const [stats, recentUsers, dailyUsage] = await Promise.all([
    getStats(),
    getRecentUsers(),
    getDailyUsage(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-dark-500">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Usuários"
          value={formatNumber(stats.totalUsers)}
          icon={Users}
          trend={`${stats.activeUsers24h} ativos`}
          color="blue"
        />
        <StatsCard
          title="Mensagens Hoje"
          value={formatNumber(stats.messagesToday)}
          icon={MessageSquare}
          trend={`${formatNumber(stats.totalMessages)} total`}
          color="green"
        />
        <StatsCard
          title="Conversas"
          value={formatNumber(stats.totalConversations)}
          icon={Zap}
          color="purple"
        />
        <StatsCard
          title="Custo Estimado"
          value={formatCurrency(stats.estimatedCostToday)}
          icon={DollarSign}
          trend="Hoje"
          color="yellow"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageChart data={dailyUsage} />
        <RecentUsers users={recentUsers} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
}
