# Hotel Booking App: Out of Scope and Future Improvements

Not included in this build.

## Staff and accounts

| Item | Now | Future |
|---|---|---|
| Staff invitations | Anyone can sign up as staff. | Existing staff invite new staff by email; only invited emails can sign up. |
| Third-party sign-in | Manual sign-up with email and password. | Sign in with Google (or similar). |
| Guest accounts | Guests book without an account. | Guests sign up and log in to see their bookings and reuse their details. |

## Availability and booking

| Item | Now | Future |
|---|---|---|
| Availability window | Availability returns every booked night from tomorrow onward, with no end. | Only a set window, e.g. the next 2 months; guests can't book beyond it. |
| Stay length limits | No minimum or maximum stay. | Set a minimum and maximum number of nights. |
| Multiple rooms | One room. | Several rooms or room types, each with its own availability. |
| Pricing and payments | No prices or payments. | Nightly rates, a total shown before booking, and online payment or deposit. |

## Staff bookings list

| Item | Now | Future |
|---|---|---|
| Pagination | The list returns every booking at once. | Pages of bookings, e.g. 20 at a time. |

## Security

| Item | Now | Future |
|---|---|---|
| Rate limiting | No limits on requests. | Limit requests per IP, especially login, sign-up and booking. |

## Other

- No email.
- Guests can't change or cancel bookings.
- No password reset.
- No scaling, backups, monitoring or compliance.

## Chat assistant

- Chat history only lasts for the page visit. It isn't saved to local storage, so a refresh clears it.
- No attachments in the chat.
- The message box is one line and doesn't grow as you type.
- The chat can't change dates or guest details.
- Each reply shows up all at once when it's ready.
- The FAQ is fixed text in the code.
- No limit on chat messages.
- English only.
- No tracking of chat cost or errors.
- Staff can't ask the chat about bookings (who booked which dates, a booking's details). They use the bookings page. The chat only shows a booking's details in the staff Cancel flow.
