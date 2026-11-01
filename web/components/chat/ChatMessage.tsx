import type { ChatRole } from '@/lib/types';
import { SENDER_LABELS } from './chatCopy';

type ChatMessageProps = {
  role: ChatRole;
  content: string;
};

const BUBBLES: Record<ChatRole, string> = {
  user: 'self-end bg-primary text-on-primary',
  assistant: 'self-start bg-surface-muted text-foreground',
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <li
      className={`max-w-4/5 rounded-xl px-3 py-2 text-sm wrap-break-word whitespace-pre-wrap ${BUBBLES[role]}`}
    >
      <span className="sr-only">{SENDER_LABELS[role]}: </span>
      {content}
    </li>
  );
}
