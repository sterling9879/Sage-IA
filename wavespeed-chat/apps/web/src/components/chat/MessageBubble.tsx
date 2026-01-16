'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Avatar } from '@/components/ui/Avatar';
import { MessageActions } from './MessageActions';
import type { MessageItem } from '@/types';
import { cn, formatTime } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageItem;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === 'USER';

  return (
    <div
      className={cn(
        'group flex gap-4',
        isUser && 'flex-row-reverse'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <Avatar
            src={session?.user?.image}
            name={session?.user?.name}
            size="md"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
            <Bot className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex max-w-[80%] flex-col', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-dark-100 text-dark-900 dark:bg-dark-800 dark:text-dark-100'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;

                    if (isInline) {
                      return (
                        <code
                          className="rounded bg-dark-200 px-1.5 py-0.5 font-mono text-sm dark:bg-dark-700"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !bg-dark-900 !p-4"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="mb-2 list-disc pl-4">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="mb-2 list-decimal pl-4">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="mb-1">{children}</li>;
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message Info */}
        <div
          className={cn(
            'mt-1 flex items-center gap-2 text-xs text-dark-500',
            isUser && 'flex-row-reverse'
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {message.model && (
            <>
              <span>·</span>
              <span className="text-dark-400">{message.model.split('/').pop()}</span>
            </>
          )}
          {message.isEdited && (
            <>
              <span>·</span>
              <span className="text-dark-400">editado</span>
            </>
          )}
        </div>

        {/* Actions */}
        <MessageActions message={message} isVisible={isHovered} />
      </div>
    </div>
  );
}
