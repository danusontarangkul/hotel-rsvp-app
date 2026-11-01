import { BOOKING_NUMBER_LENGTH } from '../bookings/bookings.constants';

export const CHAT_FAQ = `
- The hotel has one room.
- The earliest check-in is tomorrow. Today and past dates can't be booked.
- Check-out must be after check-in.
- A guest can check in on the day the previous guest checks out.
- There is no minimum or maximum stay.
- To book, a guest gives their check-in and check-out dates, name, phone number and email.
- After booking, the guest gets a ${BOOKING_NUMBER_LENGTH}-character booking number. Keep it to refer to the booking.
- No confirmation email is sent.
- There are no prices or online payments.
- Guests can't change or cancel a booking. Only hotel staff can cancel a booking.
- Guests don't need an account to book.
`;
