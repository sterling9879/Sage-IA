'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, formatDateTime, cn, getInitials } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: 'FREE' | 'PRO' | 'UNLIMITED';
  messagesUsed: number;
  messagesLimit: number;
  isBanned: boolean;
  createdAt: Date;
  lastActiveAt: Date | null;
  _count: {
    conversations: number;
    messages: number;
  };
}

interface UsersTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    plan: string;
    status: string;
  };
}

const planColors = {
  FREE: 'badge-info',
  PRO: 'badge-success',
  UNLIMITED: 'badge-warning',
};

export function UsersTable({ users, pagination, filters }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    router.push(`/users?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/users?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full rounded-lg border border-dark-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </form>

        <select
          value={filters.plan}
          onChange={(e) => updateFilters({ plan: e.target.value })}
          className="rounded-lg border border-dark-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Todos os planos</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="UNLIMITED">Unlimited</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="rounded-lg border border-dark-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="banned">Banidos</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Plano</th>
              <th>Uso</th>
              <th>Conversas</th>
              <th>Status</th>
              <th>Última atividade</th>
              <th>Cadastro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                      {user.name ? getInitials(user.name) : '?'}
                    </div>
                    <div>
                      <p className="font-medium text-dark-900">
                        {user.name || 'Sem nome'}
                      </p>
                      <p className="text-xs text-dark-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={cn('badge', planColors[user.plan])}>
                    {user.plan}
                  </span>
                </td>
                <td>
                  <div className="text-sm">
                    <span className="font-medium">{user.messagesUsed}</span>
                    <span className="text-dark-400">/{user.messagesLimit}</span>
                  </div>
                </td>
                <td>{user._count.conversations}</td>
                <td>
                  <span
                    className={cn(
                      'badge',
                      user.isBanned ? 'badge-error' : 'badge-success'
                    )}
                  >
                    {user.isBanned ? 'Banido' : 'Ativo'}
                  </span>
                </td>
                <td className="text-dark-500">
                  {user.lastActiveAt
                    ? formatDateTime(user.lastActiveAt)
                    : 'Nunca'}
                </td>
                <td className="text-dark-500">{formatDate(user.createdAt)}</td>
                <td>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === user.id ? null : user.id)
                      }
                      className="rounded p-1 hover:bg-dark-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openMenu === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-dark-200 bg-white py-1 shadow-lg">
                          <Link
                            href={`/users/${user.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-dark-100"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalhes
                          </Link>
                          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-dark-100">
                            <RefreshCw className="h-4 w-4" />
                            Resetar uso
                          </button>
                          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
                            <Ban className="h-4 w-4" />
                            {user.isBanned ? 'Desbanir' : 'Banir'}
                          </button>
                          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark-500">
          Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
          {pagination.total}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="rounded-lg border border-dark-200 p-2 hover:bg-dark-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="rounded-lg border border-dark-200 p-2 hover:bg-dark-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
