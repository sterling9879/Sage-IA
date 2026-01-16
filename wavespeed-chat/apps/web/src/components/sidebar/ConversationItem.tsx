'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  MoreVertical,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConversations } from '@/hooks/useConversations';
import { useUIStore } from '@/stores/ui-store';
import type { Conversation } from '@/types';
import { cn, truncate, formatRelativeTime } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title || '');
  const { deleteConversation, renameConversation, togglePin, archiveConversation } =
    useConversations();
  const { setSidebarOpen } = useUIStore();

  const isActive = pathname === `/c/${conversation.id}`;

  const handleDelete = () => {
    deleteConversation(conversation.id);
    setShowMenu(false);
  };

  const handleRename = () => {
    if (title.trim() && title !== conversation.title) {
      renameConversation(conversation.id, title.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleTogglePin = () => {
    togglePin(conversation.id);
    setShowMenu(false);
  };

  const handleArchive = () => {
    archiveConversation(conversation.id);
    setShowMenu(false);
  };

  const handleClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="flex items-center gap-2 rounded-lg bg-dark-100 p-2 dark:bg-dark-800">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            className="flex-1 bg-transparent text-sm text-dark-900 outline-none dark:text-dark-100"
          />
        </div>
      ) : (
        <Link
          href={`/c/${conversation.id}`}
          onClick={handleClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
            'hover:bg-dark-100 dark:hover:bg-dark-800',
            isActive && 'bg-dark-100 dark:bg-dark-800'
          )}
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-dark-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-dark-900 dark:text-dark-100">
              {truncate(conversation.title || 'Nova conversa', 30)}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              {formatRelativeTime(conversation.updatedAt)}
            </p>
          </div>
          {conversation.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-primary-500" />
          )}
        </Link>
      )}

      {/* Menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          showMenu && 'opacity-100'
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-dark-200 bg-white py-1 shadow-lg dark:border-dark-700 dark:bg-dark-800">
            <button
              onClick={handleTogglePin}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700"
            >
              {conversation.isPinned ? (
                <>
                  <PinOff className="h-4 w-4" />
                  Desafixar
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4" />
                  Fixar
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700"
            >
              <Pencil className="h-4 w-4" />
              Renomear
            </button>
            <button
              onClick={handleArchive}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-700 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-700"
            >
              <Archive className="h-4 w-4" />
              Arquivar
            </button>
            <div className="my-1 border-t border-dark-200 dark:border-dark-700" />
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
}
