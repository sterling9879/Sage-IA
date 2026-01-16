'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ModelSelector } from '@/components/model-picker/ModelSelector';
import { useUIStore } from '@/stores/ui-store';

export function ChatHeader() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex items-center justify-between border-b border-dark-200 bg-white px-4 py-3 dark:border-dark-800 dark:bg-dark-900">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <ModelSelector />

      <div className="w-10" /> {/* Spacer for balance */}
    </header>
  );
}
