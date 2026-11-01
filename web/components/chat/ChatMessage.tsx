import type { ChatRole } from '@/lib/types';
import { BUBBLE, BUBBLE_ROLES } from './chatBubbles';
import { SENDER_LABELS } from './chatCopy';

type ChatMessageProps = {
  role: ChatRole;
  content: string;
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <li
      className={`${BUBBLE} wrap-break-word whitespace-pre-wrap ${BUBBLE_ROLES[role]}`}
    >
      <span className="sr-only">{SENDER_LABELS[role]}: </span>
      {content}
    </li>
  );
}
