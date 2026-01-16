'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Key,
  Cpu,
  Sliders,
  FileText,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Usuários', href: '/users', icon: Users },
  { name: 'Conversas', href: '/conversations', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const settings = [
  { name: 'Geral', href: '/settings', icon: Settings },
  { name: 'API Keys', href: '/settings/api-keys', icon: Key },
  { name: 'Modelos', href: '/settings/models', icon: Cpu },
  { name: 'Limites', href: '/settings/limits', icon: Sliders },
];

const system = [{ name: 'Logs', href: '/logs', icon: FileText }];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-dark-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-dark-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-dark-900">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-dark-500">
            Principal
          </p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-dark-600 hover:bg-dark-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-dark-500">
            Configurações
          </p>
          <ul className="space-y-1">
            {settings.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-dark-600 hover:bg-dark-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* System */}
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-dark-500">
            Sistema
          </p>
          <ul className="space-y-1">
            {system.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-dark-600 hover:bg-dark-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
