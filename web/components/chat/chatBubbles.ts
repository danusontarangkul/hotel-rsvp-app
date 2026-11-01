import type { ChatRole } from '@/lib/types';

export const BUBBLE = 'max-w-4/5 rounded-xl px-3 py-2 text-sm';

export const BUBBLE_ROLES: Record<ChatRole, string> = {
  user: 'self-end bg-primary text-on-primary',
  assistant: 'self-start bg-surface-muted text-foreground',
};
