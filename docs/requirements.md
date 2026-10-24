# Hotel Booking App: Requirements

A small weekend build for a single hotel with one room. Small scale; not for real production use.

## Users
- **Guest**
- **Hotel Staff**

## Functional requirements

### Guest
1. Browses a calendar of available dates.
2. Books by choosing check-in and check-out dates and entering a name, a phone number and an email, and gets a booking number shown on screen.
3. Guests cannot change or cancel bookings.

### Hotel Staff
4. Signs up for a staff account with a name, email and password.
5. Logs in with their email and password.
6. Sees all bookings, including cancelled ones: guest name, contact, check-in, check-out, booking number, status.
7. Cancels a booking, which makes those dates available again. Only staff can cancel.

### Booking rules
- There is one room. No two bookings can share a night.
- Same-day turnover is allowed: a guest can check in on the day the previous guest checks out (a Mon to Wed stay can be followed by a Wed check-in).
- Check-out must be after check-in.
- Today and past dates cannot be booked. The earliest check-in is tomorrow.

## Nonfunctional requirements
- Bookings and staff accounts are saved in a simple database (MongoDB) and survive a restart.
- Staff passwords are stored hashed, never as plain text.
- Staff pages need a staff login.
- Works in phone and desktop browsers.

## Out of scope
Prices, payments, email, guest accounts, more than one room, guests changing or cancelling bookings, password reset, scaling, backups, monitoring, compliance.

## User stories

**User Story 1: As a guest, I want to browse for available dates.**
Acceptance criteria:
- A calendar shows upcoming dates, starting with tomorrow.
- Today and past dates are blocked off.
- Booked dates are blocked off.
- A previous guest's check-out day shows as open for check-in.

**User Story 2: As a guest, I want to book the room for my dates.**
Acceptance criteria:
- I select a check-in and check-out date on the calendar; blocked dates can't be selected.
- Check-out must be after check-in, and my stay can't include a booked night.
- I must enter a name, a phone number and an email. If any is missing, I see an error.
- After I submit, I see a booking number and those dates become blocked off.
- If someone books the same dates first, I see a message that they're no longer available.

**User Story 3: As hotel staff, I want to sign up for a staff account.**
Acceptance criteria:
- I enter my name, email and password.
- An email that's already registered shows an error.
- The password must be at least 8 characters.
- After signing up, I'm logged in and taken to the bookings page.

**User Story 4: As hotel staff, I want to log in.**
Acceptance criteria:
- The correct email and password open the staff pages.
- A wrong email or password shows an error.
- Staff pages can't be opened without logging in.
- I can log out.

**User Story 5: As hotel staff, I want to view all bookings.**
Acceptance criteria:
- Each booking shows guest name, contact, check-in, check-out and booking number.
- Cancelled bookings are shown too, marked as cancelled.
- All bookings, active and cancelled, are sorted by check-in date.
- With no bookings, a "No bookings" message shows.

**User Story 6: As hotel staff, I want to cancel a booking.**
Acceptance criteria:
- I'm asked to confirm before it's cancelled.
- A cancelled booking stays in the list marked as cancelled, and its dates open up for guests.
- Guests can't cancel bookings.
