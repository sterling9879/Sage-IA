'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatDate, getInitials, cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string;
  plan: 'FREE' | 'PRO' | 'UNLIMITED';
  createdAt: Date;
}

interface RecentUsersProps {
  users: User[];
}

const planColors = {
  FREE: 'bg-dark-100 text-dark-600',
  PRO: 'bg-primary-100 text-primary-700',
  UNLIMITED: 'bg-amber-100 text-amber-700',
};

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-900">Usuários Recentes</h3>
        <Link
          href="/users"
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
              {user.name ? getInitials(user.name) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-dark-900">
                {user.name || 'Sem nome'}
              </p>
              <p className="truncate text-sm text-dark-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  planColors[user.plan]
                )}
              >
                {user.plan}
              </span>
              <span className="text-xs text-dark-400">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
