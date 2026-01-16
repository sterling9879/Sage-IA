'use client';

import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatArea />
      <ChatInput />
    </div>
  );
}
