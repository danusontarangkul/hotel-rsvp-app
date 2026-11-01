'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import { ChatIcon } from '@/components/shared/icons';
import { useChat } from '@/hooks/useChat';
import { useCheckAvailability } from '@/hooks/useCheckAvailability';
import { useCreateBooking } from '@/hooks/useCreateBooking';
import { announceAvailabilityChanged } from '@/lib/availability-events';
import { toFormErrors } from '@/lib/form-errors';
import type { ChatTurn } from '@/lib/types';
import ChatPanel from './ChatPanel';
import {
  YES_NO_STEPS,
  afterAvailabilityCheck,
  afterBooking,
  afterBookingFailed,
  answerBookingFlow,
  startBookingFlow,
  type BookingFlow,
  type BookingFlowResult,
} from './bookingFlow';
import {
  BOOK_STAY_OPTION,
  CHAT_GREETING,
  FIXED_REPLIES,
  OPEN_CHAT_LABEL,
  START_OPTIONS,
  YES_NO_OPTIONS,
} from './chatCopy';

const GREETING: ChatTurn = { role: 'assistant', content: CHAT_GREETING };

function withReplies(conversation: ChatTurn[], replies: string[]): ChatTurn[] {
  return [
    ...conversation,
    ...replies.map((content): ChatTurn => ({ role: 'assistant', content })),
  ];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatTurn[]>([GREETING]);
  const [flow, setFlow] = useState<BookingFlow | null>(null);
  const [showStartOptions, setShowStartOptions] = useState<boolean>(true);
  const chat = useChat();
  const availabilityCheck = useCheckAvailability();
  const booking = useCreateBooking();
  const sending = chat.loading || availabilityCheck.loading || booking.loading;

  async function followUp(
    result: BookingFlowResult,
  ): Promise<BookingFlowResult | null> {
    if (result.next === 'checkAvailability' && result.flow) {
      const availability = await availabilityCheck.run(undefined);
      return afterAvailabilityCheck(result.flow, availability);
    }
    if (result.next === 'book' && result.flow) {
      const confirmation = await booking.run(result.flow.draft);
      if (confirmation) {
        announceAvailabilityChanged();
        return afterBooking(confirmation);
      }
      const availability = await availabilityCheck.run(undefined);
      return afterBookingFailed(result.flow, availability);
    }
    return null;
  }

  async function continueBooking(
    conversation: ChatTurn[],
    result: BookingFlowResult,
  ) {
    setFlow(result.flow);
    const next = await followUp(result);
    const final = next ?? result;
    setFlow(final.flow);
    setMessages(
      withReplies(conversation, [...result.replies, ...(next?.replies ?? [])]),
    );
    if (final.flow === null) {
      setShowStartOptions(true);
    }
  }

  async function askModel(conversation: ChatTurn[]) {
    const response = await chat.run({ messages: conversation });
    if (response) {
      setMessages(withReplies(conversation, [response.reply]));
      setShowStartOptions(true);
      if (response.availabilityChanged) {
        announceAvailabilityChanged();
      }
    }
  }

  async function handleSend(content: string) {
    setShowStartOptions(false);
    const conversation: ChatTurn[] = [...messages, { role: 'user', content }];
    setMessages(conversation);
    if (flow) {
      await continueBooking(
        conversation,
        answerBookingFlow(flow, content, new Date()),
      );
      return;
    }
    if (content === BOOK_STAY_OPTION) {
      await continueBooking(conversation, startBookingFlow());
      return;
    }
    const fixedReply = FIXED_REPLIES[content];
    if (fixedReply) {
      setMessages(withReplies(conversation, [fixedReply]));
      return;
    }
    await askModel(conversation);
  }

  function quickReplies(): string[] {
    if (sending) {
      return [];
    }
    if (flow) {
      return YES_NO_STEPS.includes(flow.step) ? YES_NO_OPTIONS : [];
    }
    return showStartOptions ? START_OPTIONS : [];
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-40 flex justify-end sm:left-auto">
      {isOpen ? (
        <div className="w-full sm:w-96">
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            onMinimize={() => setIsOpen(false)}
            sending={sending}
            errors={toFormErrors(chat.error, []).form}
            quickReplies={quickReplies()}
            onQuickReply={handleSend}
          />
        </div>
      ) : (
        <Button
          variant="round"
          aria-label={OPEN_CHAT_LABEL}
          onClick={() => setIsOpen(true)}
        >
          <ChatIcon />
        </Button>
      )}
    </div>
  );
}
