'use client';

import { Copy, RefreshCw, Pencil, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { useUIStore } from '@/stores/ui-store';
import { copyToClipboard } from '@/lib/utils';
import type { MessageItem } from '@/types';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  message: MessageItem;
  isVisible: boolean;
}

export function MessageActions({ message, isVisible }: MessageActionsProps) {
  const { regenerateMessage } = useChat();
  const { addToast } = useUIStore();
  const isAssistant = message.role === 'ASSISTANT';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      addToast({ type: 'success', message: 'Copiado!' });
    } else {
      addToast({ type: 'error', message: 'Erro ao copiar' });
    }
  };

  const handleRegenerate = () => {
    regenerateMessage(message.id);
  };

  return (
    <div
      className={cn(
        'mt-2 flex items-center gap-1 transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-8 w-8 text-dark-400 hover:text-dark-600"
        title="Copiar"
      >
        <Copy className="h-4 w-4" />
      </Button>

      {isAssistant && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRegenerate}
            className="h-8 w-8 text-dark-400 hover:text-dark-600"
            title="Regenerar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-4 w-px bg-dark-200 dark:bg-dark-700" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-dark-400 hover:text-green-600"
            title="Útil"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-dark-400 hover:text-red-600"
            title="Não útil"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </>
      )}

      {!isAssistant && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-dark-400 hover:text-dark-600"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
