'use client';

import { Check, Code, Eye, MessageSquare } from 'lucide-react';
import type { Model } from '@/types';
import { cn } from '@/lib/utils';

interface ModelOptionProps {
  model: Model;
  isSelected: boolean;
  isFree: boolean;
  onSelect: () => void;
}

export function ModelOption({ model, isSelected, isFree, onSelect }: ModelOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left',
        'hover:bg-dark-100 dark:hover:bg-dark-700',
        isSelected && 'bg-primary-50 dark:bg-primary-900/20'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium text-sm',
              isSelected
                ? 'text-primary-700 dark:text-primary-400'
                : 'text-dark-900 dark:text-dark-100'
            )}
          >
            {model.name}
          </span>
          {isFree && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              FREE
            </span>
          )}
        </div>

        {/* Capabilities */}
        <div className="mt-1 flex items-center gap-2">
          {model.capabilities.map((cap) => (
            <span
              key={cap}
              className="flex items-center gap-1 text-[10px] text-dark-500 dark:text-dark-400"
              title={cap}
            >
              {cap === 'chat' && <MessageSquare className="h-3 w-3" />}
              {cap === 'code' && <Code className="h-3 w-3" />}
              {cap === 'vision' && <Eye className="h-3 w-3" />}
              {cap}
            </span>
          ))}
        </div>
      </div>

      {isSelected && (
        <Check className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
      )}
    </button>
  );
}
