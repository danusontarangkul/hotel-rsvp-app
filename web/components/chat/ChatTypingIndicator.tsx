import { BUBBLE, BUBBLE_ROLES } from './chatBubbles';
import { TYPING_LABEL } from './chatCopy';

const DOT_ANIMATIONS = [
  'motion-safe:animate-typing-dot',
  'motion-safe:animate-typing-dot-second',
  'motion-safe:animate-typing-dot-third',
] as const;

export default function ChatTypingIndicator() {
  return (
    <li className={`${BUBBLE} ${BUBBLE_ROLES.assistant}`}>
      <span
        role="status"
        aria-label={TYPING_LABEL}
        className="flex h-5 items-center gap-1"
      >
        {DOT_ANIMATIONS.map((animation) => (
          <span
            key={animation}
            className={`size-1.5 rounded-full bg-muted ${animation}`}
          />
        ))}
      </span>
    </li>
  );
}
