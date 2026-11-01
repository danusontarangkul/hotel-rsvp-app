export const CHAT_MODEL = 'CHAT_MODEL';
export const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
export const DEFAULT_OLLAMA_MODEL = 'qwen3:8b';

export const CHAT_ROLES = ['user', 'assistant'] as const;
export const MAX_MESSAGE_LENGTH = 200;
export const MAX_CHAT_MESSAGES = 10;
export const MAX_TOOL_ROUNDS = 3;
export const CHAT_CONTEXT_TOKENS = 8192;
export const CHAT_REPLY_TOKENS = 512;

export const GET_AVAILABILITY_TOOL = 'get_availability';
export const UNKNOWN_TOOL = 'Unknown tool.';
export const TOOL_DATES_INVALID =
  'Dates must be real dates in YYYY-MM-DD form. Work out the date from what the user wrote and call again. Do not ask the user for a date format.';
export const STAY_NIGHTS_BOOKED =
  'Some nights in this stay are already booked.';

export const oneNight = (night: string): string => `The night of ${night}`;
export const nightsFromTo = (checkIn: string, checkOut: string): string =>
  `${checkIn} to ${checkOut}`;
export const stayAvailable = (stay: string): string => `${stay} is available.`;
export const stayTooEarly = (stay: string, earliest: string): string =>
  `${stay} can't be booked. The earliest check-in is ${earliest}.`;
export const STAY_CHECK_OUT_NOT_AFTER_CHECK_IN =
  'Check-out has to be after check-in, so that stay needs a later check-out date.';
export const oneNightBooked = (night: string): string =>
  `${oneNight(night)} is already booked.`;
export const stayOneNightBooked = (stay: string, night: string): string =>
  `${stay} is not available because the night of ${night} is already booked.`;
export const stayNightsBooked = (stay: string, nights: string): string =>
  `${stay} is not available because the nights of ${nights} are already booked.`;

export const NO_PERMISSION = 'You do not have permission.';
export const CANNOT_HELP = 'Unfortunately, I cannot help with that.';
export const CHAT_UNAVAILABLE = 'Chat is unavailable.';

export const MESSAGES_REQUIRED = 'Messages are required.';
export const ROLE_INVALID = 'Role must be user or assistant.';
export const CONTENT_REQUIRED = 'Message content is required.';
export const CONTENT_TOO_LONG = `Message content must be at most ${MAX_MESSAGE_LENGTH} characters.`;
export const LAST_MESSAGE_NOT_FROM_USER =
  'The last message must be from the user.';
