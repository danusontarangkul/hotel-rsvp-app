# Hotel Booking App: Pages

## Routes

| URL | Who | User Story | API calls |
|---|---|---|---|
| `/` | Guest | User Story 1, User Story 2, User Stories 7 to 10 | GET `/api/availability`, POST `/api/bookings`, GET `/api/auth/me`, POST `/api/auth/logout`, POST `/api/chat` |
| `/staff/signup` | Staff | User Story 3 | POST `/api/auth/signup` |
| `/staff/login` | Staff | User Story 4 | POST `/api/auth/login` |
| `/staff/bookings` | Staff (logged in) | User Story 4, 5, 6, User Stories 7 to 10 | GET `/api/bookings`, POST `/api/bookings/:id/cancel`, POST `/api/auth/logout`, POST `/api/chat` |

## Page flow

- `/` → pick a check-in then a check-out on the calendar → the "Your stay" panel beside it shows the dates and the guest details form → book → a modal shows the booking number and dates → close → the form clears and the calendar reloads with the new dates blocked.
- On a booking `409`, a modal shows "Dates no longer available" with the API message; closing it clears the dates (the guest details stay filled in) and reloads availability.
- `/` and `/staff/bookings` → "Open chat" button in the bottom right → the chat panel opens with a greeting and suggested questions → type and send → the message shows in the panel → the reply shows in the panel, and if it booked a stay, the calendar reloads. Minimize closes the panel back to the button and keeps the messages.
- Suggested questions (`START_OPTIONS` in `components/chat/chatCopy.ts`) show when the chat opens, after every reply from the model, and after a booking ends. They're hidden while a reply is loading and during the booking steps. Clicking one sends it as the guest's message.
- "Availability" → the fixed reply "What date(s) are you asking about availability for?" without calling the API → the guest types dates → the model answers whether they're available.
- "FAQs" → the fixed reply "What would you like to know?" without calling the API → the guest types a question → the model answers from the FAQ, or says it can't help.
- The fixed replies are `FIXED_REPLIES` in `components/chat/chatCopy.ts`.
- "Book" → a fixed step-by-step flow that never calls the model (`components/chat/bookingFlow.ts`), one question at a time:
  1. "What is your check-in date?" → "What is your check-out date?" Dates can be typed like "Nov 12", "11/12" or "2026-11-12"; with no year it uses this year, or next year if the date has passed.
  2. GET `/api/availability` → if free, "<check-in> to <check-out> is available. Is that right?" with Yes/No buttons. If not free or too early, it says why and asks for the check-in date again. No starts the dates again.
  3. "What is your full name?" → "What is your phone number?" (10 digits) → "What is your email address?" Each is checked before moving on.
  4. All the details are repeated with "Shall I book it?" and Yes/No buttons.
  5. Yes → POST `/api/bookings` → "You're booked from … Your booking number is …" and the calendar reloads. No → "No problem, nothing was booked."
  6. If the booking fails because the dates were just taken, it asks for new dates; any other failure offers to try again.
- "Cancel" shows only for logged-in staff (GET `/api/auth/me`), after the other three. It's a fixed flow that never calls the model (`components/chat/cancelFlow.ts`):
  1. "What is the confirmation ID?" → GET `/api/bookings/by-number/:bookingNumber` (spaces removed, uppercased). Not found → it says so and asks again.
  2. Found → shows the booking number, name, phone, email, check-in and check-out, a warning that cancelling can't be undone, and asks the staff member to type `CONFIRM` exactly. An already-cancelled booking says so and ends.
  3. Exactly `CONFIRM` → POST `/api/bookings/:id/cancel` → "Booking … is cancelled. Its dates are open again." and the calendar and staff bookings list reload. Anything else → "No problem, nothing was cancelled."
- `/staff/bookings` → "Cancel booking" on a row → "Cancel this booking?" modal → "Cancel booking" → the list reloads and the row shows as cancelled. "Keep booking", ×, Escape or a click outside closes the modal and changes nothing.
- `/staff/signup` or `/staff/login` → success → `/staff/bookings`
- `/staff/bookings` → `401` from the API → `/staff/login`
- Log out → `/`
