import type { CHAT_ROLES } from './chat.constants';

export type ChatRole = (typeof CHAT_ROLES)[number];

export type ChatAudience = 'guest' | 'staff';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ModelToolCall = {
  name: string;
  arguments: Record<string, unknown>;
};

export type ModelMessage = {
  role: 'system' | 'tool' | ChatRole;
  content: string;
  toolCalls?: ModelToolCall[];
  toolName?: string;
};

export type ModelToolParameter = {
  type: 'string';
  description: string;
};

export type ModelTool = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ModelToolParameter>;
    required: string[];
  };
};

export type ModelReply = {
  content: string;
  toolCalls: ModelToolCall[];
};

export type ChatModel = {
  reply: (messages: ModelMessage[], tools: ModelTool[]) => Promise<ModelReply>;
};

export type StayCheck =
  | { available: true }
  | {
      available: false;
      reason: string;
      bookedNightsInStay?: string[];
    };

export type ToolOutcome = {
  content: string;
  availabilityChanged: boolean;
  finalReply?: string;
};

export type ToolRound = {
  messages: ModelMessage[];
  finalReplies: string[];
  availabilityChanged: boolean;
};

export type ModelAnswer = {
  content: string;
  availabilityChanged: boolean;
};

export type ChatResponse = {
  reply: string;
  availabilityChanged: boolean;
};
