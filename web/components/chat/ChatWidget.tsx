'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import { ChatIcon } from '@/components/shared/icons';
import { useChat } from '@/hooks/useChat';
import { toFormErrors } from '@/lib/form-errors';
import type { ChatTurn } from '@/lib/types';
import ChatPanel from './ChatPanel';
import { CHAT_GREETING, OPEN_CHAT_LABEL } from './chatCopy';

const GREETING: ChatTurn = { role: 'assistant', content: CHAT_GREETING };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatTurn[]>([GREETING]);
  const { run, loading, error } = useChat();

  async function handleSend(content: string) {
    const conversation: ChatTurn[] = [...messages, { role: 'user', content }];
    setMessages(conversation);
    const response = await run({ messages: conversation });
    if (response) {
      setMessages([
        ...conversation,
        { role: 'assistant', content: response.reply },
      ]);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-40 flex justify-end sm:left-auto">
      {isOpen ? (
        <div className="w-full sm:w-96">
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            onMinimize={() => setIsOpen(false)}
            sending={loading}
            errors={toFormErrors(error, []).form}
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
