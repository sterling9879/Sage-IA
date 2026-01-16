'use client';

import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { NewChatButton } from './NewChatButton';
import { ConversationList } from './ConversationList';
import { UserMenu } from './UserMenu';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full w-72 flex-col bg-dark-50 dark:bg-dark-900',
          'border-r border-dark-200 dark:border-dark-800',
          'transition-transform duration-300 md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-200 p-4 dark:border-dark-800">
          <h1 className="text-xl font-bold text-dark-900 dark:text-dark-100">
            AI Chat
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <NewChatButton />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>

        {/* User Menu */}
        <UserMenu />
      </aside>
    </>
  );
}
