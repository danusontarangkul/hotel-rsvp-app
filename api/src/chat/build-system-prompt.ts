import {
  AUDIENCE_PROMPTS,
  CHAT_SYSTEM_PROMPT,
  TODAY_PROMPT_PREFIX,
} from './chat-system-prompt';
import type { ChatAudience } from './chat.types';

export function buildSystemPrompt(
  audience: ChatAudience,
  today: string,
): string {
  return [
    CHAT_SYSTEM_PROMPT,
    AUDIENCE_PROMPTS[audience],
    `${TODAY_PROMPT_PREFIX} ${today}.`,
  ].join('\n\n');
}
