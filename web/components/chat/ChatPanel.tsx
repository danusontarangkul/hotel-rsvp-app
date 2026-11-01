'use client';

import Button from '@/components/shared/Button';
import { MinimizeIcon } from '@/components/shared/icons';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import type { ChatTurn } from '@/lib/types';
import ChatComposer from './ChatComposer';
import ChatMessage from './ChatMessage';
import { CHAT_TITLE, MESSAGES_LABEL, MINIMIZE_CHAT_LABEL } from './chatCopy';

type ChatPanelProps = {
  messages: ChatTurn[];
  onSend: (content: string) => void;
  onMinimize: () => void;
};

export default function ChatPanel({
  messages,
  onSend,
  onMinimize,
}: ChatPanelProps) {
  const listRef = useScrollToBottom<HTMLOListElement>(messages);

  return (
    <section
      aria-label={CHAT_TITLE}
      className="flex h-112 flex-col rounded-xl border border-border bg-surface shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-heading text-lg text-foreground">{CHAT_TITLE}</h2>
        <Button
          variant="icon"
          aria-label={MINIMIZE_CHAT_LABEL}
          onClick={onMinimize}
        >
          <MinimizeIcon />
        </Button>
      </div>
      <ol
        ref={listRef}
        aria-label={MESSAGES_LABEL}
        aria-live="polite"
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3"
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}
      </ol>
      <div className="border-t border-border px-4 pt-3">
        <ChatComposer onSend={onSend} />
      </div>
    </section>
  );
}
