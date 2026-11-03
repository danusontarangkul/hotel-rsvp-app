import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ApiError,
  cancelBooking,
  createBooking,
  findBookingByNumber,
  getAvailability,
  getCurrentStaff,
  sendChat,
} from '@/lib/api';
import { listenForAvailabilityChanged } from '@/lib/availability-events';
import ChatWidget from './ChatWidget';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  sendChat: jest.fn(),
  getAvailability: jest.fn(),
  createBooking: jest.fn(),
  getCurrentStaff: jest.fn(),
  findBookingByNumber: jest.fn(),
  cancelBooking: jest.fn(),
}));

const mockSendChat = jest.mocked(sendChat);
const mockGetAvailability = jest.mocked(getAvailability);
const mockCreateBooking = jest.mocked(createBooking);
const mockGetCurrentStaff = jest.mocked(getCurrentStaff);
const mockFindBookingByNumber = jest.mocked(findBookingByNumber);
const mockCancelBooking = jest.mocked(cancelBooking);

const onAvailabilityChanged = jest.fn();
let stopListening: () => void = () => {};

beforeEach(() => {
  stopListening = listenForAvailabilityChanged(onAvailabilityChanged);
});

afterEach(() => {
  stopListening();
});

const REPLY = 'Unfortunately, I cannot help with that.';

beforeEach(() => {
  mockSendChat.mockResolvedValue({ reply: REPLY, availabilityChanged: false });
  mockGetCurrentStaff.mockResolvedValue(null);
});

afterEach(() => {
  jest.resetAllMocks();
});

async function openChat() {
  render(<ChatWidget />);
  await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
}

describe('ChatWidget', () => {
  it('starts minimized', () => {
    render(<ChatWidget />);

    expect(screen.getByRole('button', { name: 'Open chat' })).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Chat' }),
    ).not.toBeInTheDocument();
  });

  it('opens the chat with the greeting', async () => {
    await openChat();

    expect(screen.getByRole('region', { name: 'Chat' })).toBeVisible();
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'How can I help you today?',
    );
  });

  it('adds a sent message to the chat', async () => {
    await openChat();

    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent(
      'Is Nov 3 open?',
    );
  });

  it('sends the whole conversation to the API', async () => {
    await openChat();

    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    expect(mockSendChat).toHaveBeenCalledWith({
      messages: [
        { role: 'assistant', content: 'How can I help you today?' },
        { role: 'user', content: 'Is Nov 3 open?' },
      ],
    });
  });

  it('shows the reply after the sent message', async () => {
    await openChat();

    await userEvent.type(
      screen.getByLabelText('Message'),
      'Is Nov 3 open?{Enter}',
    );

    await screen.findByText(REPLY, { exact: false });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[2]).toHaveTextContent(`Assistant: ${REPLY}`);
  });

  it('shows the typing indicator while waiting for the reply', async () => {
    mockSendChat.mockReturnValue(new Promise(() => {}));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(
      screen.getByRole('status', { name: 'Assistant is typing' }),
    ).toBeInTheDocument();
  });

  it('replaces the typing indicator with the reply', async () => {
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText(REPLY, { exact: false });

    expect(
      screen.queryByRole('status', { name: 'Assistant is typing' }),
    ).not.toBeInTheDocument();
  });

  it('hides the typing indicator when sending fails', async () => {
    mockSendChat.mockRejectedValue(new ApiError(503, ['Chat is unavailable.']));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText('Chat is unavailable.');

    expect(
      screen.queryByRole('status', { name: 'Assistant is typing' }),
    ).not.toBeInTheDocument();
  });

  it('marks Send busy while waiting for the reply', async () => {
    mockSendChat.mockReturnValue(new Promise(() => {}));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('shows the API message and keeps the sent message when sending fails', async () => {
    mockSendChat.mockRejectedValue(new ApiError(503, ['Chat is unavailable.']));
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

    expect(await screen.findByText('Chat is unavailable.')).toBeVisible();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('Hello');
  });

  it('tells the page availability changed after the chat books a stay', async () => {
    mockSendChat.mockResolvedValue({
      reply: 'You are booked. Your booking number is K7Q2MX.',
      availabilityChanged: true,
    });
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Yes{Enter}');
    await screen.findByText('K7Q2MX', { exact: false });

    expect(onAvailabilityChanged).toHaveBeenCalledTimes(1);
  });

  it('does not tell the page anything changed after a plain reply', async () => {
    await openChat();

    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText(REPLY, { exact: false });

    expect(onAvailabilityChanged).not.toHaveBeenCalled();
  });

  describe('Book', () => {
    const availability = {
      firstBookableDate: '2026-11-02',
      bookedNights: ['2026-11-20', '2026-11-21'],
    };

    beforeEach(() => {
      jest.useFakeTimers({
        advanceTimers: true,
        now: new Date(2026, 10, 1, 12),
      });
      mockGetAvailability.mockResolvedValue(availability);
      mockCreateBooking.mockResolvedValue({
        bookingNumber: 'K7Q2MX',
        checkIn: '2026-11-12',
        checkOut: '2026-11-14',
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    function lastReply(): string {
      const items = screen.getAllByRole('listitem');
      return items[items.length - 1].textContent ?? '';
    }

    async function untilReplied(send: () => Promise<void>) {
      const before = screen.getAllByRole('listitem').length;
      await send();
      await waitFor(() => {
        expect(
          screen.queryByRole('status', { name: 'Assistant is typing' }),
        ).not.toBeInTheDocument();
        expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(
          before + 2,
        );
      });
    }

    async function say(text: string) {
      await untilReplied(() =>
        userEvent.type(screen.getByLabelText('Message'), `${text}{Enter}`),
      );
    }

    async function choose(option: string) {
      await untilReplied(() =>
        userEvent.click(screen.getByRole('button', { name: option })),
      );
    }

    async function startBooking() {
      await openChat();
      await choose('Book');
    }

    async function giveDates(checkIn = 'Nov 12', checkOut = 'Nov 14') {
      await say(checkIn);
      await say(checkOut);
      await screen.findByText(/is available\. Is that right\?$/);
    }

    async function giveDetails() {
      await choose('Yes');
      await say('Ana Lopez');
      await say('(555) 010-0123');
      await say('ana@example.com');
    }

    it('asks for the check-in date first', async () => {
      await startBooking();

      expect(lastReply()).toBe('Assistant: What is your check-in date?');
    });

    it('starts the booking steps when the guest types that they want to book', async () => {
      await openChat();
      await say('I want to book a room');

      expect(lastReply()).toBe('Assistant: What is your check-in date?');
      expect(mockSendChat).not.toHaveBeenCalled();
    });

    it('sends a question about booking to the model', async () => {
      await openChat();
      await say('Do I need to book in advance?');

      expect(mockSendChat).toHaveBeenCalledTimes(1);
    });

    function replies(): string[] {
      return screen
        .getAllByRole('listitem')
        .map((item) => item.textContent ?? '');
    }

    it('shows each question once', async () => {
      await startBooking();
      await say('Nov 12');

      expect(replies()).toEqual([
        'Assistant: How can I help you today?',
        'You: Book',
        'Assistant: What is your check-in date?',
        'You: Nov 12',
        'Assistant: What is your check-out date?',
      ]);
    });

    it('shows the availability answer once after the check-out date', async () => {
      await startBooking();
      await giveDates();

      expect(replies().slice(-2)).toEqual([
        'You: Nov 14',
        'Assistant: Thursday, November 12, 2026 to Saturday, November 14, 2026 is available. Is that right?',
      ]);
    });

    it('shows the booking confirmation once', async () => {
      await startBooking();
      await giveDates();
      await giveDetails();
      await choose('Yes');
      await screen.findByText(/Your booking number is K7Q2MX\.$/);

      expect(replies().slice(-2)).toEqual([
        'You: Yes',
        "Assistant: You're booked from Thursday, November 12, 2026 to Saturday, November 14, 2026. Your booking number is K7Q2MX.",
      ]);
    });

    it('asks one question at a time, check-out after check-in', async () => {
      await startBooking();

      await say('Nov 12');

      expect(lastReply()).toBe('Assistant: What is your check-out date?');
    });

    it('checks availability and repeats the dates to confirm', async () => {
      await startBooking();

      await giveDates();

      expect(mockGetAvailability).toHaveBeenCalledTimes(1);
      expect(lastReply()).toBe(
        'Assistant: Thursday, November 12, 2026 to Saturday, November 14, 2026 is available. Is that right?',
      );
      expect(screen.getByRole('button', { name: 'Yes' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'No' })).toBeVisible();
    });

    it('asks for new dates when they are not available', async () => {
      await startBooking();

      await say('Nov 19');
      await say('Nov 22');

      expect(
        await screen.findByText(/isn't available\. What check-in date/),
      ).toBeVisible();
    });

    it('asks for name, phone and email in order', async () => {
      await startBooking();
      await giveDates();

      await choose('Yes');
      expect(lastReply()).toBe('Assistant: What is your full name?');
      await say('Ana Lopez');
      expect(lastReply()).toBe('Assistant: What is your phone number?');
      await say('(555) 010-0123');
      expect(lastReply()).toBe('Assistant: What is your email address?');
    });

    it('repeats every detail and asks to confirm before booking', async () => {
      await startBooking();
      await giveDates();

      await giveDetails();

      expect(lastReply()).toContain('Name: Ana Lopez');
      expect(lastReply()).toContain('Phone: (555) 010-0123');
      expect(lastReply()).toContain('Email: ana@example.com');
      expect(lastReply()).toContain('Shall I book it?');
      expect(mockCreateBooking).not.toHaveBeenCalled();
    });

    it('books after confirming and shows the booking number', async () => {
      await startBooking();
      await giveDates();
      await giveDetails();

      await choose('Yes');

      expect(
        await screen.findByText(/Your booking number is K7Q2MX\.$/),
      ).toBeVisible();
      expect(mockCreateBooking).toHaveBeenCalledWith({
        checkIn: '2026-11-12',
        checkOut: '2026-11-14',
        guestName: 'Ana Lopez',
        guestPhone: '5550100123',
        guestEmail: 'ana@example.com',
      });
      expect(onAvailabilityChanged).toHaveBeenCalledTimes(1);
    });

    it('never asks the model during the booking steps', async () => {
      await startBooking();
      await giveDates();
      await giveDetails();
      await choose('Yes');
      await screen.findByText(/Your booking number is K7Q2MX\.$/);

      expect(mockSendChat).not.toHaveBeenCalled();
    });

    it('books nothing when the guest says no at the end', async () => {
      await startBooking();
      await giveDates();
      await giveDetails();

      await choose('No');

      expect(lastReply()).toBe('Assistant: No problem, nothing was booked.');
      expect(mockCreateBooking).not.toHaveBeenCalled();
    });

    it('offers the starting options again after the booking', async () => {
      await startBooking();
      await giveDates();
      await giveDetails();
      await choose('Yes');
      await screen.findByText(/Your booking number is K7Q2MX\.$/);

      expect(screen.getByRole('button', { name: 'Book' })).toBeVisible();
    });

    it('asks for new dates when someone else books them first', async () => {
      mockCreateBooking.mockRejectedValue(
        new ApiError(409, ['Those dates are no longer available.']),
      );
      await startBooking();
      await giveDates();
      await giveDetails();
      mockGetAvailability.mockResolvedValue({
        ...availability,
        bookedNights: ['2026-11-12', '2026-11-13'],
      });

      await choose('Yes');

      expect(
        await screen.findByText(/those dates were just booked/),
      ).toBeVisible();
    });
  });

  describe('Cancel', () => {
    const booking = {
      id: '6718f1d3a1b2c3d4e5f60719',
      bookingNumber: 'K7Q2MX',
      guestName: 'Ana Lopez',
      guestEmail: 'ana@example.com',
      guestPhone: '5550100123',
      checkIn: '2026-11-12',
      checkOut: '2026-11-14',
      status: 'active' as const,
      createdAt: '2026-11-01T19:00:00.000Z',
      cancelledAt: null,
    };

    function messageTexts(): string[] {
      return screen
        .getAllByRole('listitem')
        .map((item) => item.textContent ?? '');
    }

    function lastMessage(): string {
      const texts = messageTexts();
      return texts[texts.length - 1];
    }

    async function untilReplied(send: () => Promise<void>) {
      const before = screen.getAllByRole('listitem').length;
      await send();
      await waitFor(() => {
        expect(
          screen.queryByRole('status', { name: 'Assistant is typing' }),
        ).not.toBeInTheDocument();
        expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(
          before + 2,
        );
      });
    }

    async function say(text: string) {
      await untilReplied(() =>
        userEvent.type(screen.getByLabelText('Message'), `${text}{Enter}`),
      );
    }

    async function openAsStaff() {
      mockGetCurrentStaff.mockResolvedValue({
        id: '6718f0c2a1b2c3d4e5f60718',
        name: 'Sam Lee',
        email: 'sam@hotel.com',
      });
      await openChat();
      await screen.findByRole('button', { name: 'Cancel' });
    }

    async function startCancel() {
      await openAsStaff();
      await untilReplied(() =>
        userEvent.click(screen.getByRole('button', { name: 'Cancel' })),
      );
    }

    beforeEach(() => {
      mockFindBookingByNumber.mockResolvedValue({ booking });
      mockCancelBooking.mockResolvedValue({
        ...booking,
        status: 'cancelled',
        cancelledAt: '2026-11-01T20:00:00.000Z',
      });
    });

    it('is not offered to guests', async () => {
      await openChat();
      await screen.findByRole('button', { name: 'Availability' });

      expect(
        screen.queryByRole('button', { name: 'Cancel' }),
      ).not.toBeInTheDocument();
    });

    it('is offered to logged-in staff after the other options', async () => {
      await openAsStaff();

      const group = screen.getByRole('group', { name: 'Suggested questions' });
      expect(
        within(group)
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual(['Availability', 'Book', 'FAQs', 'Cancel']);
    });

    it('starts the cancel steps when staff type that they want to cancel', async () => {
      await openAsStaff();
      await say('I want to cancel a booking');

      expect(lastMessage()).toBe('Assistant: What is the confirmation ID?');
      expect(mockSendChat).not.toHaveBeenCalled();
    });

    it('sends a guest asking to cancel to the model', async () => {
      await openChat();
      await screen.findByRole('button', { name: 'Availability' });
      await say('I want to cancel a booking');

      expect(mockSendChat).toHaveBeenCalledTimes(1);
      expect(mockFindBookingByNumber).not.toHaveBeenCalled();
    });

    it('asks for the confirmation ID', async () => {
      await startCancel();

      expect(messageTexts().slice(-2)).toEqual([
        'You: Cancel',
        'Assistant: What is the confirmation ID?',
      ]);
    });

    it('looks the booking up and shows its details with a warning', async () => {
      await startCancel();

      await say('k7q2mx');

      expect(mockFindBookingByNumber).toHaveBeenCalledWith('K7Q2MX');
      expect(lastMessage()).toContain('Name: Ana Lopez');
      expect(lastMessage()).toContain('Phone: (555) 010-0123');
      expect(lastMessage()).toContain('Email: ana@example.com');
      expect(lastMessage()).toContain('Check-in: Thursday, November 12, 2026');
      expect(lastMessage()).toContain('Check-out: Saturday, November 14, 2026');
      expect(lastMessage()).toContain("Warning: cancelling can't be undone.");
      expect(lastMessage()).toContain('type CONFIRM exactly');
    });

    it('cancels after CONFIRM and says so', async () => {
      await startCancel();
      await say('K7Q2MX');

      await say('CONFIRM');

      expect(mockCancelBooking).toHaveBeenCalledWith(booking.id);
      expect(lastMessage()).toBe(
        'Assistant: Booking K7Q2MX is cancelled. Its dates are open again.',
      );
      expect(onAvailabilityChanged).toHaveBeenCalledTimes(1);
    });

    it('keeps the booking after anything other than CONFIRM', async () => {
      await startCancel();
      await say('K7Q2MX');

      await say('confirm');

      expect(mockCancelBooking).not.toHaveBeenCalled();
      expect(lastMessage()).toBe(
        'Assistant: No problem, nothing was cancelled.',
      );
    });

    it('asks again for an unknown confirmation ID', async () => {
      mockFindBookingByNumber.mockResolvedValue({ booking: null });
      await startCancel();

      await say('ZZZZZZ');

      expect(lastMessage()).toBe(
        "Assistant: I couldn't find a booking with confirmation ID ZZZZZZ. What is the confirmation ID?",
      );
    });

    it('never asks the model during the cancel steps', async () => {
      await startCancel();
      await say('K7Q2MX');
      await say('CONFIRM');

      expect(mockSendChat).not.toHaveBeenCalled();
    });

    it('shows each message once', async () => {
      await startCancel();
      await say('K7Q2MX');
      await say('CONFIRM');

      expect(messageTexts()).toHaveLength(7);
    });

    it('offers the starting options again after cancelling', async () => {
      await startCancel();
      await say('K7Q2MX');
      await say('CONFIRM');

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });
  });

  describe('suggested questions', () => {
    function availabilityButton() {
      return screen.queryByRole('button', { name: 'Availability' });
    }

    it('offers "Availability" when the chat opens', async () => {
      await openChat();

      expect(availabilityButton()).toBeVisible();
    });

    it('offers all three options in order when the chat opens', async () => {
      await openChat();

      const group = screen.getByRole('group', { name: 'Suggested questions' });
      expect(
        within(group)
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual(['Availability', 'Book', 'FAQs']);
    });

    describe('FAQs', () => {
      function faqButton() {
        return screen.getByRole('button', { name: 'FAQs' });
      }

      it('asks what they would like to know', async () => {
        await openChat();

        await userEvent.click(faqButton());

        expect(
          screen.getAllByRole('listitem').map((item) => item.textContent ?? ''),
        ).toEqual([
          'Assistant: How can I help you today?',
          'You: FAQs',
          'Assistant: What would you like to know?',
        ]);
      });

      it('does not call the API when clicked', async () => {
        await openChat();

        await userEvent.click(faqButton());

        expect(mockSendChat).not.toHaveBeenCalled();
      });

      it('sends the question to the chat with the conversation so far', async () => {
        await openChat();
        await userEvent.click(faqButton());

        await userEvent.type(
          screen.getByLabelText('Message'),
          'What time is check-in?{Enter}',
        );

        expect(mockSendChat).toHaveBeenCalledWith({
          messages: [
            { role: 'assistant', content: 'How can I help you today?' },
            { role: 'user', content: 'FAQs' },
            { role: 'assistant', content: 'What would you like to know?' },
            { role: 'user', content: 'What time is check-in?' },
          ],
        });
        expect(await screen.findByText(REPLY, { exact: false })).toBeVisible();
      });
    });

    it('asks which dates after "Availability" is clicked', async () => {
      await openChat();

      await userEvent.click(availabilityButton() as HTMLElement);

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[1]).toHaveTextContent('You: Availability');
      expect(items[2]).toHaveTextContent(
        'Assistant: What date(s) are you asking about availability for?',
      );
    });

    it('does not call the API when a suggested question is clicked', async () => {
      await openChat();

      await userEvent.click(availabilityButton() as HTMLElement);

      expect(mockSendChat).not.toHaveBeenCalled();
    });

    it('hides the suggested questions once one is clicked', async () => {
      await openChat();

      await userEvent.click(availabilityButton() as HTMLElement);

      expect(availabilityButton()).not.toBeInTheDocument();
    });

    it('hides the suggested questions while waiting for a reply', async () => {
      mockSendChat.mockReturnValue(new Promise(() => {}));
      await openChat();

      await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');

      expect(availabilityButton()).not.toBeInTheDocument();
    });

    it('shows the suggested questions again after the chat replies', async () => {
      await openChat();
      await userEvent.click(availabilityButton() as HTMLElement);

      await userEvent.type(screen.getByLabelText('Message'), 'Nov 6{Enter}');
      await screen.findByText(REPLY, { exact: false });

      const group = screen.getByRole('group', { name: 'Suggested questions' });
      expect(
        within(group)
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual(['Availability', 'Book', 'FAQs']);
    });

    it('sends the dates with the whole conversation so far', async () => {
      await openChat();
      await userEvent.click(availabilityButton() as HTMLElement);

      await userEvent.type(screen.getByLabelText('Message'), 'Nov 6{Enter}');

      expect(mockSendChat).toHaveBeenCalledWith({
        messages: [
          { role: 'assistant', content: 'How can I help you today?' },
          { role: 'user', content: 'Availability' },
          {
            role: 'assistant',
            content: 'What date(s) are you asking about availability for?',
          },
          { role: 'user', content: 'Nov 6' },
        ],
      });
    });
  });

  it('minimizes the chat', async () => {
    await openChat();

    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );

    expect(
      screen.queryByRole('region', { name: 'Chat' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open chat' })).toBeVisible();
  });

  it('keeps the messages after minimizing and opening again', async () => {
    await openChat();
    await userEvent.type(screen.getByLabelText('Message'), 'Hello{Enter}');
    await screen.findByText(REPLY, { exact: false });

    await userEvent.click(
      screen.getByRole('button', { name: 'Minimize chat' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Hello');
  });
});
