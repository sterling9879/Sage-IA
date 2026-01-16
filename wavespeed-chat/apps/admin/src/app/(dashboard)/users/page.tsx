import { prisma } from '@/lib/prisma';
import { UsersTable } from '@/components/users/UsersTable';

interface SearchParams {
  page?: string;
  search?: string;
  plan?: string;
  status?: string;
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { email: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  if (searchParams.plan && searchParams.plan !== 'all') {
    where.plan = searchParams.plan;
  }

  if (searchParams.status === 'active') {
    where.isBanned = false;
  } else if (searchParams.status === 'banned') {
    where.isBanned = true;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        messagesUsed: true,
        messagesLimit: true,
        isBanned: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: { conversations: true, messages: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { users, pagination } = await getUsers(searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Usuários</h1>
        <p className="text-dark-500">
          Gerencie todos os usuários da plataforma
        </p>
      </div>

      <UsersTable
        users={users}
        pagination={pagination}
        filters={{
          search: searchParams.search || '',
          plan: searchParams.plan || 'all',
          status: searchParams.status || 'all',
        }}
      />
    </div>
  );
}
