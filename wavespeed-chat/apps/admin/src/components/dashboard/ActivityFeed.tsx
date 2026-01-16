import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { UserPlus, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

async function getRecentActivity() {
  const [recentUsers, recentLogs] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, level: true, message: true, createdAt: true },
    }),
  ]);

  const activities = [
    ...recentUsers.map((user) => ({
      id: `user-${user.id}`,
      type: 'user' as const,
      message: `Novo usuário: ${user.name || user.email}`,
      createdAt: user.createdAt,
    })),
    ...recentLogs.map((log) => ({
      id: `log-${log.id}`,
      type: log.level === 'ERROR' ? ('error' as const) : ('info' as const),
      message: log.message,
      createdAt: log.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return activities.slice(0, 5);
}

const icons = {
  user: UserPlus,
  info: CheckCircle,
  error: AlertTriangle,
};

const colors = {
  user: 'bg-green-100 text-green-600',
  info: 'bg-blue-100 text-blue-600',
  error: 'bg-red-100 text-red-600',
};

export async function ActivityFeed() {
  const activities = await getRecentActivity();

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-dark-900">
        Atividade Recente
      </h3>

      {activities.length === 0 ? (
        <p className="text-center text-dark-500">Nenhuma atividade recente</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = icons[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[activity.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-900">{activity.message}</p>
                  <p className="text-xs text-dark-400">
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
