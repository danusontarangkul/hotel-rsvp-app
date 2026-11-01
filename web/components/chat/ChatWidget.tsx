'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import { ChatIcon } from '@/components/shared/icons';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { useChat } from '@/hooks/useChat';
import { useCheckAvailability } from '@/hooks/useCheckAvailability';
import { useCreateBooking } from '@/hooks/useCreateBooking';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';
import { useFindBooking } from '@/hooks/useFindBooking';
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
  afterCancel,
  afterLookUp,
  answerCancelFlow,
  startCancelFlow,
  type CancelFlow,
  type CancelFlowResult,
} from './cancelFlow';
import {
  BOOK_STAY_OPTION,
  CANCEL_OPTION,
  CHAT_GREETING,
  FIXED_REPLIES,
  OPEN_CHAT_LABEL,
  STAFF_START_OPTIONS,
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
  const [bookingFlow, setBookingFlow] = useState<BookingFlow | null>(null);
  const [cancelFlow, setCancelFlow] = useState<CancelFlow | null>(null);
  const [showStartOptions, setShowStartOptions] = useState<boolean>(true);
  const currentStaff = useCurrentStaff();
  const chat = useChat();
  const availabilityCheck = useCheckAvailability();
  const booking = useCreateBooking();
  const bookingLookup = useFindBooking();
  const cancellation = useCancelBooking();
  const isStaff = Boolean(currentStaff.data);
  const sending =
    chat.loading ||
    availabilityCheck.loading ||
    booking.loading ||
    bookingLookup.loading ||
    cancellation.loading;

  function showReplies(conversation: ChatTurn[], replies: string[]) {
    setMessages(withReplies(conversation, replies));
  }

  async function bookingFollowUp(
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
    setBookingFlow(result.flow);
    const next = await bookingFollowUp(result);
    const final = next ?? result;
    setBookingFlow(final.flow);
    showReplies(conversation, [...result.replies, ...(next?.replies ?? [])]);
    if (final.flow === null) {
      setShowStartOptions(true);
    }
  }

  async function cancelFollowUp(
    result: CancelFlowResult,
  ): Promise<CancelFlowResult | null> {
    if (result.next === 'lookUp' && result.flow?.step === 'lookingUp') {
      const { bookingNumber } = result.flow;
      return afterLookUp(bookingNumber, await bookingLookup.run(bookingNumber));
    }
    if (result.next === 'cancel' && result.flow?.step === 'confirmCancel') {
      const { booking: toCancel } = result.flow;
      const cancelled = await cancellation.run(toCancel.id);
      if (cancelled) {
        announceAvailabilityChanged();
      }
      return afterCancel(toCancel, cancelled);
    }
    return null;
  }

  async function continueCancel(
    conversation: ChatTurn[],
    result: CancelFlowResult,
  ) {
    setCancelFlow(result.flow);
    const next = await cancelFollowUp(result);
    const final = next ?? result;
    setCancelFlow(final.flow);
    showReplies(conversation, [...result.replies, ...(next?.replies ?? [])]);
    if (final.flow === null) {
      setShowStartOptions(true);
    }
  }

  async function askModel(conversation: ChatTurn[]) {
    const response = await chat.run({ messages: conversation });
    if (response) {
      showReplies(conversation, [response.reply]);
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
    if (cancelFlow) {
      await continueCancel(conversation, answerCancelFlow(cancelFlow, content));
      return;
    }
    if (bookingFlow) {
      await continueBooking(
        conversation,
        answerBookingFlow(bookingFlow, content, new Date()),
      );
      return;
    }
    if (content === CANCEL_OPTION && isStaff) {
      await continueCancel(conversation, startCancelFlow());
      return;
    }
    if (content === BOOK_STAY_OPTION) {
      await continueBooking(conversation, startBookingFlow());
      return;
    }
    const fixedReply = FIXED_REPLIES[content];
    if (fixedReply) {
      showReplies(conversation, [fixedReply]);
      return;
    }
    await askModel(conversation);
  }

  function quickReplies(): string[] {
    if (sending || cancelFlow) {
      return [];
    }
    if (bookingFlow) {
      return YES_NO_STEPS.includes(bookingFlow.step) ? YES_NO_OPTIONS : [];
    }
    if (!showStartOptions) {
      return [];
    }
    return isStaff ? STAFF_START_OPTIONS : START_OPTIONS;
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
