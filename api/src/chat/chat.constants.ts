export const CHAT_MODEL = 'CHAT_MODEL';
export const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
export const DEFAULT_OLLAMA_MODEL = 'qwen3:8b';

export const CHAT_ROLES = ['user', 'assistant'] as const;
export const MAX_MESSAGE_LENGTH = 200;
export const MAX_CHAT_MESSAGES = 10;
export const MAX_TOOL_ROUNDS = 3;
export const CHAT_CONTEXT_TOKENS = 8192;
export const CHAT_REPLY_TOKENS = 512;

export const NO_PERMISSION = 'You do not have permission.';
export const CANNOT_HELP = 'Unfortunately, I cannot help with that.';
export const CHAT_UNAVAILABLE = 'Chat is unavailable.';

export const MESSAGES_REQUIRED = 'Messages are required.';
export const ROLE_INVALID = 'Role must be user or assistant.';
export const CONTENT_REQUIRED = 'Message content is required.';
export const CONTENT_TOO_LONG = `Message content must be at most ${MAX_MESSAGE_LENGTH} characters.`;
export const LAST_MESSAGE_NOT_FROM_USER =
  'The last message must be from the user.';
