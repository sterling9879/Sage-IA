'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronUp,
  Crown,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/hooks/useUser';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userData, usagePercentage } = useUser();
  const { theme, setTheme } = useUIStore();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Apply theme to document
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getPlanBadge = () => {
    if (!userData) return null;
    const badges = {
      FREE: { label: 'Free', color: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-300' },
      PRO: { label: 'Pro', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
      UNLIMITED: { label: 'Unlimited', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    };
    return badges[userData.plan];
  };

  const planBadge = getPlanBadge();

  return (
    <div className="relative border-t border-dark-200 p-4 dark:border-dark-800">
      {/* Usage bar for free users */}
      {userData?.plan === 'FREE' && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-dark-500 dark:text-dark-400">
            <span>Mensagens de hoje</span>
            <span>{userData.messagesUsed}/{userData.messagesLimit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-dark-200 dark:bg-dark-700">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                usagePercentage >= 90 ? 'bg-red-500' :
                usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-primary-500'
              )}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-dark-100 dark:hover:bg-dark-800"
      >
        <Avatar src={user?.image} name={user?.name} size="md" />
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-sm font-medium text-dark-900 dark:text-dark-100">
            {user?.name || 'Usuário'}
          </p>
          <p className="truncate text-xs text-dark-500 dark:text-dark-400">
            {user?.email}
          </p>
        </div>
        {planBadge && (
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded', planBadge.color)}>
            {planBadge.label}
          </span>
        )}
        <ChevronUp className={cn('h-4 w-4 text-dark-400 transition-transform', !isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-4 right-4 z-20 mb-2 rounded-lg border border-dark-200 bg-white py-1 shadow-lg dark:border-dark-700 dark:bg-dark-800">
            {/* Upgrade button for free users */}
            {userData?.plan === 'FREE' && (
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20">
                <Crown className="h-4 w-4" />
                Fazer upgrade
              </button>
            )}

            {/* Theme options */}
            <div className="px-3 py-2">
              <p className="mb-2 text-xs font-semibold uppercase text-dark-500 dark:text-dark-400">
                Tema
              </p>
              <div className="flex gap-1">
                {[
                  { value: 'light' as const, icon: Sun, label: 'Claro' },
                  { value: 'dark' as const, icon: Moon, label: 'Escuro' },
                  { value: 'system' as const, icon: Monitor, label: 'Sistema' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value)}
                    title={label}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-sm',
                      theme === value
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-dark-600 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1 border-t border-dark-200 dark:border-dark-700" />

            <button
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </button>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
