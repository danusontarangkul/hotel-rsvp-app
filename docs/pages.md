# Hotel Booking App: Pages

## Routes

| URL | Who | User Story | API calls |
|---|---|---|---|
| `/` | Guest | User Story 1, User Story 2, User Stories 7 to 11 | GET `/api/availability`, POST `/api/bookings`, GET `/api/auth/me`, POST `/api/auth/logout`, POST `/api/chat` |
| `/staff/signup` | Staff | User Story 3 | POST `/api/auth/signup` |
| `/staff/login` | Staff | User Story 4 | POST `/api/auth/login` |
| `/staff/bookings` | Staff (logged in) | User Story 4, 5, 6 | GET `/api/bookings`, POST `/api/bookings/:id/cancel`, POST `/api/auth/logout` |

## Page flow

- `/` → pick a check-in then a check-out on the calendar → the "Your stay" panel beside it shows the dates and the guest details form → book → a modal shows the booking number and dates → close → the form clears and the calendar reloads with the new dates blocked.
- On a booking `409`, a modal shows "Dates no longer available" with the API message; closing it clears the dates (the guest details stay filled in) and reloads availability.
- `/` → type in the chat → the reply shows in the chat panel. If the reply booked or cancelled a stay, the calendar reloads.
- `/staff/bookings` → "Cancel booking" on a row → "Cancel this booking?" modal → "Cancel booking" → the list reloads and the row shows as cancelled. "Keep booking", ×, Escape or a click outside closes the modal and changes nothing.
- `/staff/signup` or `/staff/login` → success → `/staff/bookings`
- `/staff/bookings` → `401` from the API → `/staff/login`
- Log out → `/`
