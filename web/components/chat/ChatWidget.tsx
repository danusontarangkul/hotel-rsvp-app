'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import { ChatIcon } from '@/components/shared/icons';
import type { ChatTurn } from '@/lib/types';
import ChatPanel from './ChatPanel';
import { CHAT_GREETING, OPEN_CHAT_LABEL } from './chatCopy';

const GREETING: ChatTurn = { role: 'assistant', content: CHAT_GREETING };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatTurn[]>([GREETING]);

  function handleSend(content: string) {
    setMessages((current) => [...current, { role: 'user', content }]);
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-40 flex justify-end sm:left-auto">
      {isOpen ? (
        <div className="w-full sm:w-96">
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            onMinimize={() => setIsOpen(false)}
          />
        </div>
      ) : (
        <Button
          variant="round"
          aria-label={OPEN_CHAT_LABEL}
          onClick={() => setIsOpen(true)}
        >
          <ChatIcon />
        </Button>
      )}
    </div>
  );
}
