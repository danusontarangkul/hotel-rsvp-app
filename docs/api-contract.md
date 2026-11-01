# Hotel Booking App: API Contract

NestJS REST API. All paths start with `/api` (the Next.js rewrite forwards them unchanged). JSON in and out. Dates are `YYYY-MM-DD` strings.

## Endpoints

| Method | Path | Auth | User Story |
|---|---|---|---|
| GET | `/api/availability` | None | User Story 1: Browse dates |
| POST | `/api/bookings` | None | User Story 2: Book |
| POST | `/api/auth/signup` | None | User Story 3: Staff sign up |
| POST | `/api/auth/login` | None | User Story 4: Staff log in |
| POST | `/api/auth/logout` | None | User Story 4: Staff log out |
| GET | `/api/auth/me` | Staff | User Story 4: Show log out on the home page |
| GET | `/api/bookings` | Staff | User Story 5: View bookings |
| POST | `/api/bookings/:id/cancel` | Staff | User Story 6: Cancel |
| POST | `/api/chat` | Optional | User Stories 7 to 11: Chat |

"Staff" means a valid login cookie is required. A missing, empty, tampered or expired `token` cookie returns `401` with `message` `Unauthorized`, before the endpoint does anything.

"Optional" means the login cookie is read if present. A valid cookie is treated as staff; a missing or invalid one is treated as a guest, never a `401`.

## Errors

All errors use the NestJS default shape:

```json
{ "statusCode": 409, "message": "Those dates are no longer available.", "error": "Conflict" }
```

For `400` validation errors, `message` is a list of strings, one per problem.

---

## GET /api/availability

User Story 1. Returns the booked nights from tomorrow onward.

**Response `200`**
```json
{
  "firstBookableDate": "2026-10-25",
  "bookedNights": ["2026-10-27", "2026-10-28", "2026-11-03"]
}
```

- `firstBookableDate` is tomorrow's date in the hotel's time zone. Today and earlier dates are blocked.
- `bookedNights` is sorted earliest first and has no today or past nights. A stay's check-out day is not a night, so it is never listed.
- No login needed.
- A night listed here cannot be the start of a stay or inside one. A date can be a check-out day even if it is booked (same-day turnover).

## POST /api/bookings

User Story 2.

**Request**
```json
{
  "guestName": "Ana Lopez",
  "guestEmail": "ana@example.com",
  "guestPhone": "5550100123",
  "checkIn": "2026-10-27",
  "checkOut": "2026-10-29"
}
```

All five fields are required.

- `guestName`: not blank.
- `guestEmail`: valid email format.
- `guestPhone`: not blank.
- `checkIn`: valid date, tomorrow or later.
- `checkOut`: valid date, after `checkIn`.

**Response `201`**
```json
{
  "bookingNumber": "K7Q2MX",
  "checkIn": "2026-10-27",
  "checkOut": "2026-10-29"
}
```

**Errors**
| Status | When |
|---|---|
| 400 | Missing or invalid data: any field missing or blank, bad email format, missing or invalid dates, check-in not after today, or check-out not after check-in. |
| 409 | Any night of the stay is already booked. `message` is exactly `Those dates are no longer available.` |

- `400` messages, one per problem: `Name is required.`, `Email must be a valid email address.`, `Phone number is required.`, `Check-in must be a date (YYYY-MM-DD).`, `Check-out must be a date (YYYY-MM-DD).`, `Check-in must be tomorrow or later.`, `Check-out must be after check-in.` Unknown fields also return `400`.
- Dates must be real calendar dates in `YYYY-MM-DD` form (`2026-02-30` is rejected).
- `bookingNumber` is 6 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no `0`, `1`, `I`, `L` or `O`, so it is easy to read aloud).
- The booking and its nights are saved in one transaction, so two requests for the same night can never both succeed.

## POST /api/auth/signup

User Story 3.

**Request**
```json
{ "name": "Sam Lee", "email": "sam@hotel.com", "password": "at-least-8" }
```

- `name`: required, trimmed. `email`: valid format, trimmed and stored lowercase. `password`: at least 8 characters.
- `400` messages (one per broken field, in this order): `Name is required.`, `Email must be a valid email address.`, `Password must be at least 8 characters.` An unknown field also returns `400`.

**Response `201`**, sets the login cookie (signed up = logged in)
```json
{ "id": "6718f0c2a1b2c3d4e5f60718", "name": "Sam Lee", "email": "sam@hotel.com" }
```

**Errors**
| Status | When |
|---|---|
| 400 | A rule above is broken. |
| 409 | Email is already registered. `message` is exactly `Email is already registered.` (the sign up page shows it under the email field). |

## POST /api/auth/login

User Story 4.

**Request**
```json
{ "email": "sam@hotel.com", "password": "at-least-8" }
```

**Response `200`**, sets the login cookie
```json
{ "id": "6718f0c2a1b2c3d4e5f60718", "name": "Sam Lee", "email": "sam@hotel.com" }
```

**Errors**
| Status | When |
|---|---|
| 400 | Email or password missing. `message` is `["Email is required."]` and/or `["Password is required."]`. |
| 401 | Wrong email or password. `message` is exactly `Wrong email or password.` for both, and both take the same time, so the response never reveals whether an email is registered. |

- `email` is trimmed and matched case-insensitively.

## GET /api/auth/me

User Story 4. Returns the logged-in staff member. The home page uses it to show "Log out" instead of "Staff log in" in the header.

**Response `200`**
```json
{ "id": "6718f0c2a1b2c3d4e5f60718", "name": "Sam Lee", "email": "sam@hotel.com" }
```

**Errors:** `401` if not logged in, or if the staff member in the token no longer exists. The web app treats this `401` as "nobody is logged in", not as an error.

## POST /api/auth/logout

User Story 4. Clears the login cookie. Works even if not logged in.

**Response `204`**, no body.

## GET /api/bookings

User Story 5. All bookings, active and cancelled, sorted by `checkIn` (earliest first), then by `createdAt`.

**Response `200`**
```json
[
  {
    "id": "6718f1d3a1b2c3d4e5f60719",
    "bookingNumber": "K7Q2MX",
    "guestName": "Ana Lopez",
    "guestEmail": "ana@example.com",
    "guestPhone": "5550100123",
    "checkIn": "2026-10-27",
    "checkOut": "2026-10-29",
    "status": "active",
    "createdAt": "2026-10-24T19:30:00.000Z",
    "cancelledAt": null
  }
]
```

- `status` is `active` or `cancelled`.
- `createdAt` and `cancelledAt` are ISO 8601 times in UTC. `cancelledAt` is `null` until the booking is cancelled.
- Who cancelled a booking (`cancelledBy`) is stored but not returned.
- No bookings returns `[]` (the page shows "No bookings").

**Errors:** `401` if not logged in.

## POST /api/bookings/:id/cancel

User Story 6. `:id` is the booking's `id` from the list. No request body. Marks the booking cancelled and frees its nights.

**Response `200`**: the updated booking, same shape as in the list, with `status: "cancelled"` and `cancelledAt` set.

**Errors**
| Status | When |
|---|---|
| 401 | Not logged in. |
| 404 | No booking with that id, including an id that is not a valid id. `message` is exactly `Booking not found.` |
| 409 | Booking is already cancelled. `message` is exactly `Booking is already cancelled.` |

- `cancelledAt` is the time of the request. The booking also saves the logged-in staff member as `cancelledBy`, which is not returned.
- The booking update and the deletion of its nights happen in one transaction, so the dates are free again the moment it succeeds. If two cancels for the same booking arrive at once, one gets `200` and the other `409`.
- Any request body is ignored.

The "are you sure?" confirmation is front end only.

## POST /api/chat

User Stories 7 to 11. Sends the conversation and returns the chat's next reply. Nothing is saved; the web app keeps the history and sends all of it each time.

**Request**
```json
{
  "messages": [
    { "role": "user", "content": "Is Nov 3 to Nov 5 open?" },
    { "role": "assistant", "content": "Yes, Nov 3 to Nov 5 is available." },
    { "role": "user", "content": "Book it for Ana Lopez, 5550100123, ana@example.com" }
  ]
}
```

- `messages`: required, at least 1 message.
- `role`: `user` or `assistant`.
- `content`: not blank. A `user` message is at most 200 characters; `assistant` replies sent back in the history can be longer.
- The last message must be from `user`.
- Only the last 10 messages are sent to the model; older ones are dropped.

**Response `200`**
```json
{
  "reply": "Please confirm: Ana Lopez, Nov 3 to Nov 5. Shall I book it?",
  "availabilityChanged": false
}
```

- `availabilityChanged` is `true` when this reply booked or cancelled a stay, so the web app reloads the calendar.
- Until the model is connected, `reply` is always `Unfortunately, I cannot help with that.` and `availabilityChanged` is `false`.

**Errors**
| Status | When |
|---|---|
| 400 | `messages` missing or empty, a bad `role`, a blank `content`, a `user` message over 200 characters, or the last message isn't from `user`. Unknown fields also return `400`. |
| 503 | Ollama is not running or doesn't respond. `message` is exactly `Chat is unavailable.` (Not returned until the model is connected.) |

- `400` messages, one per problem (a problem in several messages is listed once): `Messages are required.`, `Role must be user or assistant.`, `Message content is required.`, `Message content must be at most 200 characters.`, `The last message must be from the user.`

**Tools**

The model answers by calling these tools. The server decides which tools it gets, based on the login cookie only, never on the message history.

| Tool | Who | Does |
|---|---|---|
| `get_availability` | Everyone | Same as GET `/api/availability` |
| `create_booking` | Everyone | Same as POST `/api/bookings`, with the same rules and errors |
| `cancel_booking` | Staff | Cancels by booking number, same rules and errors as POST `/api/bookings/:id/cancel` |
| `get_bookings` | Staff | Same as GET `/api/bookings` |

- A tool error (for example `Those dates are no longer available.`) goes back to the model so it can explain it in the reply. It doesn't make the endpoint fail.
- `cancel_booking` with an unknown booking number returns `Booking not found.` to the model.
- The model is told to show the details and wait for the user to confirm before calling `create_booking` or `cancel_booking`.

## Login cookie

| Setting | Value |
|---|---|
| Name | `token` |
| Contents | JWT with the staff id |
| httpOnly | Yes |
| Secure | Yes in production |
| SameSite | Lax |
| Lifetime | 7 days |

## Notes

- No API versioning.
- "Today" and "tomorrow" use the hotel's time zone, `America/Los_Angeles` (`HOTEL_TIME_ZONE` in `api/src/common/constants.ts`).
- No maximum stay length and no limit on how far ahead a guest can book.
- Phone is stored as sent; the API only checks "not blank". The web app sends 10 digits with no formatting (e.g. `5550100123`) and formats them as `(555) 010-0123` for display.
- No pagination on the bookings list.
- Staff cannot un-cancel a booking.
- No rate limiting.
