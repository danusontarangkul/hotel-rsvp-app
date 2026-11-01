import type { CHAT_ROLES } from './chat.constants';

export type ChatRole = (typeof CHAT_ROLES)[number];

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatResponse = {
  reply: string;
  availabilityChanged: boolean;
};
