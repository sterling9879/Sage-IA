'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { MESSAGE_MAX_LENGTH } from '@/constants/models';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isSending } = useChat();
  const { canSendMessage, remainingMessages, userData } = useUser();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || !canSendMessage) return;

    await sendMessage({ message: message.trim() });
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isOverLimit = message.length > MESSAGE_MAX_LENGTH;

  return (
    <div className="border-t border-dark-200 bg-white dark:border-dark-700 dark:bg-dark-900">
      <div className="mx-auto max-w-3xl px-4 py-4">
        {!canSendMessage && userData?.plan === 'FREE' && (
          <div className="mb-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
            Você atingiu o limite de mensagens diárias. Faça upgrade para continuar.
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              'flex items-end gap-2 rounded-xl border border-dark-200 bg-dark-50 p-2',
              'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
              'dark:border-dark-700 dark:bg-dark-800',
              isOverLimit && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-dark-400 hover:text-dark-600"
              disabled
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              disabled={!canSendMessage || isSending}
              className={cn(
                'max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-dark-900 placeholder-dark-400',
                'focus:outline-none dark:text-dark-100 dark:placeholder-dark-500',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-dark-400 hover:text-dark-600"
              disabled
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || isSending || !canSendMessage || isOverLimit}
              className="shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-dark-500">
            <span>
              {userData?.plan === 'FREE' && `${remainingMessages} mensagens restantes hoje`}
            </span>
            <span className={cn(isOverLimit && 'text-red-500')}>
              {message.length}/{MESSAGE_MAX_LENGTH}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
