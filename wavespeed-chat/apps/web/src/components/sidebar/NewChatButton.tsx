'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { useUIStore } from '@/stores/ui-store';

export function NewChatButton() {
  const router = useRouter();
  const { newChat } = useChat();
  const { setSidebarOpen } = useUIStore();

  const handleNewChat = () => {
    newChat();
    router.push('/');
    setSidebarOpen(false);
  };

  return (
    <Button
      onClick={handleNewChat}
      className="w-full justify-start gap-2"
      variant="outline"
    >
      <Plus className="h-5 w-5" />
      Nova conversa
    </Button>
  );
}
