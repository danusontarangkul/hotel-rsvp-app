import { sendChat } from '@/lib/api';
import type { ChatInput, ChatReply } from '@/lib/types';
import { useApiMutation, type ApiMutation } from './useApiMutation';

export function useChat(): ApiMutation<ChatInput, ChatReply> {
  return useApiMutation<ChatInput, ChatReply>(sendChat);
}
