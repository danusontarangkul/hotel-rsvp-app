import type { CHAT_ROLES } from './chat.constants';

export type ChatRole = (typeof CHAT_ROLES)[number];

export type ChatAudience = 'guest' | 'staff';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ModelMessage = {
  role: 'system' | ChatRole;
  content: string;
};

export type ChatModel = {
  reply: (messages: ModelMessage[]) => Promise<string>;
};

export type ChatResponse = {
  reply: string;
  availabilityChanged: boolean;
};
