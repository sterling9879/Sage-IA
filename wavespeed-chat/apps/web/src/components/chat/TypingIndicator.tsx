'use client';

import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-dark-100 px-4 py-3 dark:bg-dark-800">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-dark-400"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-dark-400"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-dark-400"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
