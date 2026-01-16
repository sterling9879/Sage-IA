'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Bell, ChevronDown, User } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-dark-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-dark-900">
          Bem-vindo, {user.name || 'Admin'}
        </h2>
        <p className="text-sm text-dark-500">{user.role}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-dark-500 hover:bg-dark-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-dark-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
              {user.name ? getInitials(user.name) : <User className="h-4 w-4" />}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-dark-400 transition-transform',
                isMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-dark-200 bg-white py-1 shadow-lg">
                <div className="border-b border-dark-200 px-4 py-2">
                  <p className="text-sm font-medium text-dark-900">{user.name}</p>
                  <p className="text-xs text-dark-500">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
