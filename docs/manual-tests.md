# Hotel Booking App: Manual Tests

A checklist for testing every functional requirement by hand, including the error cases. Fill in the **Result** column with `Pass` or `Fail`, and use **Notes** for anything unexpected (what you saw, a screenshot name, the browser).

| Tester | Date | Browser and device | Web URL | Commit |
|---|---|---|---|---|
| | | | | |

## Before you start

- Run the API (`npm run start:dev` in `api/`) and the web app (`npm run dev` in `web/`), then open the web URL.
- Use a test database, not real data. Some tests create staff accounts and bookings.
- "Tomorrow" means tomorrow in hotel time (Los Angeles).
- Some tests need two browser windows. Use one normal window and one private window, so they don't share the login cookie.
- Messages in quotes must match exactly.

---

## 1. Guest: browse available dates (User Story 1)

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 1.1 | Open `/`. | While the dates load, a calendar-shaped skeleton shows, then the calendar replaces it. Two months show, starting with the month that tomorrow is in (the current month, except on its last day), with an Available / Unavailable / Selected legend underneath. | | |
| 1.2 | Look at today and the days before it. | Today and past days are greyed out and struck through, and clicking them does nothing. | | |
| 1.3 | Look at tomorrow. | Tomorrow is the first date you can click. | | |
| 1.4 | Book a stay (see section 2), then reload `/` and look at its nights. | Every night of that stay is greyed out and can't be clicked. | | |
| 1.5 | For a booked stay (for example Mon to Wed), look at its check-out day (Wed). | The check-out day is not greyed out and can be picked as a check-in. | | |
| 1.6 | Use the arrows to move months back and forth. | You can't go back before the first month shown, and you can move forward to later months. | | |
| 1.7 | Stop the API and reload `/`. | Instead of the calendar, "Something went wrong. Please try again." shows with a "Try again" button. | | |
| 1.8 | Start the API again and click "Try again". | The calendar loads. | | |

## 2. Guest: book the room (User Story 2)

### Choosing dates

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 2.1 | Before choosing any dates, look at the "Your stay" panel. | Check-in and Check-out say "Select date". The guest details fields and the Book button are not shown. | | |
| 2.2 | Click an available date. | It becomes the check-in: it's highlighted and shows in the Check-in box. Check-out still says "Select date". | | |
| 2.3 | Click a later available date. | It becomes the check-out. The nights in between are highlighted, and the "Your details" fields appear. | | |
| 2.4 | With only a check-in chosen, click the same date or an earlier one. | The clicked date becomes the new check-in. The check-out can never be on or before the check-in. | | |
| 2.5 | Choose a check-in just before a booked stay, then try to click a date after that booked stay. | Dates past the booked stay can't be chosen as check-out, because the stay can't include a booked night. | | |
| 2.6 | Choose a check-in so that the first booked night is the next check-out candidate, and click that booked date. | It can be chosen as the check-out (same-day turnover). | | |
| 2.7 | With both dates chosen, click another available date. | The selection starts over with that date as the new check-in. | | |

### Guest details and the Book button

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 2.8 | With dates chosen and the fields empty, look at Book. | Book is disabled. | | |
| 2.9 | Enter only a name. | Book is still disabled. | | |
| 2.10 | Enter a name, a valid email and only 9 phone digits. | Book is still disabled. | | |
| 2.11 | Type `5550100123` in the phone field. | It shows as `(555) 010-0123`. | | |
| 2.12 | Type more than 10 digits, or letters, in the phone field. | Only the first 10 digits are kept, and letters are ignored. A leading US `1` (for example `+1 555 010 0123`) is dropped. | | |
| 2.13 | Enter a name, a 10-digit phone and an invalid email (for example `ana@example`). | Book is still disabled. | | |
| 2.14 | Enter a name made only of spaces, plus a valid phone and email. | Book is still disabled. | | |
| 2.15 | Enter a name, a 10-digit phone and a valid email. | Book becomes enabled. | | |

### Booking

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 2.16 | Click Book. | The button shows a spinner and is disabled until the response arrives. | | |
| 2.17 | Wait for the response. | A "Booking confirmed" pop-up shows a 6-character booking number (letters and digits, never 0, 1, I, L or O) and the stay dates. | | |
| 2.18 | Click "Done". | The pop-up closes, the dates and guest fields are cleared, and the booked nights are now greyed out on the calendar. | | |
| 2.19 | Open the pop-up again by booking, then close it with ×, Escape or a click outside. | Each one closes it, the same as "Done". | | |
| 2.20 | Book again with the same email in capitals (for example `ANA@Example.com`). | The booking works. On the staff page, the email shows in lowercase. | | |

### Errors

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 2.21 | **Dates taken while filling in the form:** in window A, choose dates and fill in the details but don't click Book. In window B, book the same dates (or dates that overlap). Then click Book in window A. | Window A shows a "Dates no longer available" pop-up with "Those dates are no longer available." and "Please choose different dates." | | |
| 2.22 | In window A, click "Choose new dates". | The pop-up closes and the dates are cleared. The name, phone and email stay filled in. The calendar reloads, and window B's nights are greyed out. | | |
| 2.23 | In window A, choose free dates and click Book. | The booking works without retyping the details. | | |
| 2.24 | **Both at once:** with the same dates and details in two windows, click Book in both as close together as possible. | One window gets "Booking confirmed". The other gets "Dates no longer available". The staff page shows only one booking for those dates. | | |
| 2.25 | Stop the API and click Book. | "Something went wrong. Please try again." shows under the Book button, and the details stay filled in. | | |

## 3. Guest: cannot change or cancel bookings (Requirement 3)

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 3.1 | After booking, look at the confirmation pop-up and the home page. | There is no way to change or cancel a booking. | | |
| 3.2 | Logged out, run `curl -i -X POST http://localhost:3001/api/bookings/<booking id>/cancel`. | `401 Unauthorized`, and the booking is still active on the staff page. | | |

## 4. Staff: sign up (User Story 3)

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 4.1 | On `/`, click "Staff log in", then "Create a staff account". | The sign up page opens with Full name, Email address and Password fields. | | |
| 4.2 | With all fields empty, look at Sign up. | Sign up is disabled. | | |
| 4.3 | Enter only a name and an email. | Sign up is still disabled. | | |
| 4.4 | Enter a name, an invalid email (for example `sam@hotel`) and a password of at least 8 characters. | Sign up is still disabled. | | |
| 4.5 | Enter a 7-character password and click out of the field. | "Password must be at least 8 characters." shows under Password, and Sign up stays disabled. | | |
| 4.6 | Add an 8th character. | The message goes away. | | |
| 4.7 | Enter a name of only spaces, a valid email and a valid password. | Sign up is still disabled. | | |
| 4.8 | Enter a name, a valid email and a password of at least 8 characters. | Sign up is enabled. | | |
| 4.9 | Click the eye icon in the Password field. | The password becomes visible, and clicking again hides it. | | |
| 4.10 | Click Sign up. | The button shows a spinner and is disabled until the response arrives. | | |
| 4.11 | Wait for the response. | You land on `/staff/bookings` already logged in, with "Bookings" and "Log out" in the header. | | |
| 4.12 | **Email already registered:** log out, then sign up again with the same email, also in different capitals (`SAM@Hotel.com`). | "Email is already registered." shows under the email field. You stay on the sign up page, and the fields stay filled in. | | |
| 4.13 | Stop the API and click Sign up. | "Something went wrong. Please try again." shows, and you stay on the page. | | |
| 4.14 | Click "Log in" at the bottom of the card. | The log in page opens. | | |

## 5. Staff: log in and log out (User Story 4)

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 5.1 | Open `/staff/login` with the fields empty. | Log in is disabled. | | |
| 5.2 | Enter a valid email and a 7-character password. | Log in is still disabled. | | |
| 5.3 | Enter an invalid email and an 8-character password. | Log in is still disabled. | | |
| 5.4 | Enter the correct email and password, and click Log in. | The button shows a spinner while loading. You then land on `/staff/bookings`, and the fields are cleared. | | |
| 5.5 | Log in with the email in capitals and with spaces around it. | The log in works. | | |
| 5.6 | **Wrong password:** log in with a registered email and the wrong password. | "Wrong email or password." shows. You stay on the page, and the email stays filled in. | | |
| 5.7 | **Unknown email:** log in with an email that isn't registered. | The same "Wrong email or password." message. Nothing says whether the email exists. | | |
| 5.8 | **Staff pages need a login:** while logged out, open `/staff/bookings` directly. | You're sent to `/staff/login`. | | |
| 5.9 | Logged in, open `/`. | The header shows "Log out" instead of "Staff log in". | | |
| 5.10 | Logged out, open `/`. | The header shows "Staff log in". | | |
| 5.11 | On `/staff/bookings`, click "Log out". | You land on `/` and the header shows "Staff log in". | | |
| 5.12 | Logged in on `/`, click "Log out". | You stay on `/` and the header switches to "Staff log in". | | |
| 5.13 | After logging out, open `/staff/bookings`. | You're sent to `/staff/login`. | | |
| 5.14 | Log in, close the browser, reopen it and open `/staff/bookings`. | You're still logged in (the login lasts 7 days). | | |
| 5.15 | Logged in, delete the `token` cookie in DevTools (Application → Cookies) and reload `/staff/bookings`. | You're sent to `/staff/login`. | | |
| 5.16 | Stop the API and click Log in. | "Something went wrong. Please try again." shows. | | |

## 6. Staff: view all bookings (User Story 5)

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 6.1 | With no bookings in the database, open `/staff/bookings`. | A table-shaped skeleton shows while loading, then "No bookings". | | |
| 6.2 | Make a few bookings with different check-in dates (not in date order), then open `/staff/bookings`. | Each booking shows: guest name; contact details (email and the phone as `(555) 010-0123`); check-in; check-out; booking number; status. | | |
| 6.3 | Check the order. | Bookings are sorted by check-in date, earliest first, with active and cancelled bookings mixed together. | | |
| 6.4 | Cancel one booking (see section 7). | It stays in the list with a "Cancelled" status, a muted row and "—" instead of a Cancel button. | | |
| 6.5 | Active bookings. | Status shows "Active", with a "Cancel booking" button. | | |
| 6.6 | Stop the API and reload `/staff/bookings`. | "Something went wrong. Please try again." shows with a "Try again" button. | | |
| 6.7 | Start the API again and click "Try again". | The bookings load. | | |

## 7. Staff: cancel a booking (User Story 6)

| # | Steps | Expected | Result | Notes |
|---|---|---|---|---|
| 7.1 | Click "Cancel booking" on an active booking. | A "Cancel this booking?" pop-up shows the guest name, booking number and dates. Nothing is cancelled yet. | | |
| 7.2 | Click "Keep booking". | The pop-up closes and the booking is still active. | | |
| 7.3 | Open the pop-up again and close it with ×, Escape or a click outside. | Each one closes it without cancelling. | | |
| 7.4 | Open the pop-up again and click "Cancel booking". | The button shows a spinner, and the pop-up can't be closed while it loads. | | |
| 7.5 | Wait for the response. | The pop-up closes, the list reloads, and the booking shows as "Cancelled". | | |
| 7.6 | Open `/` (or reload it). | The cancelled booking's nights are available again. | | |
| 7.7 | Book those same dates as a guest. | The booking works. | | |
| 7.8 | **Already cancelled:** open `/staff/bookings` in two windows, both logged in. Cancel a booking in window A. In window B (not reloaded), cancel the same booking. | Window B's pop-up shows "Booking is already cancelled." | | |
| 7.9 | **Logged out meanwhile:** in window A, open the cancel pop-up. In window B, log out. Then confirm the cancel in window A. | You're sent to `/staff/login`, and the booking isn't cancelled. | | |
| 7.10 | Stop the API and confirm a cancel. | "Something went wrong. Please try again." shows in the pop-up. | | |

## Summary

| Section | Passed | Failed | Notes |
|---|---|---|---|
| 1. Browse dates | | | |
| 2. Book the room | | | |
| 3. Guests can't change or cancel | | | |
| 4. Sign up | | | |
| 5. Log in and log out | | | |
| 6. View bookings | | | |
| 7. Cancel a booking | | | |
