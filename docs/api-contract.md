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
| GET | `/api/bookings` | Staff | User Story 5: View bookings |
| POST | `/api/bookings/:id/cancel` | Staff | User Story 6: Cancel |

"Staff" means a valid login cookie is required; without one the response is `401`.

## Errors

All errors use the NestJS default shape:

```json
{ "statusCode": 409, "message": "Those dates are no longer available", "error": "Conflict" }
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
- A night listed here cannot be the start of a stay or inside one. A date can be a check-out day even if it is booked (same-day turnover).

## POST /api/bookings

User Story 2.

**Request**
```json
{
  "guestName": "Ana Lopez",
  "guestEmail": "ana@example.com",
  "guestPhone": "555-0100",
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
| 409 | Any night of the stay is already booked. |

## POST /api/auth/signup

User Story 3.

**Request**
```json
{ "name": "Sam Lee", "email": "sam@hotel.com", "password": "at-least-8" }
```

- `name`: required. `email`: valid format, stored lowercase. `password`: at least 8 characters.

**Response `201`**, sets the login cookie (signed up = logged in)
```json
{ "id": "6718f0c2a1b2c3d4e5f60718", "name": "Sam Lee", "email": "sam@hotel.com" }
```

**Errors**
| Status | When |
|---|---|
| 400 | A rule above is broken. |
| 409 | Email is already registered. |

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
| 400 | Email or password missing. |
| 401 | Wrong email or password (same message for both). |

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
    "guestPhone": "555-0100",
    "checkIn": "2026-10-27",
    "checkOut": "2026-10-29",
    "status": "active",
    "createdAt": "2026-10-24T19:30:00.000Z",
    "cancelledAt": null
  }
]
```

- `status` is `active` or `cancelled`.
- No bookings returns `[]` (the page shows "No bookings").

**Errors:** `401` if not logged in.

## POST /api/bookings/:id/cancel

User Story 6. `:id` is the booking's `id` from the list. No request body. Marks the booking cancelled and frees its nights.

**Response `200`**: the updated booking, same shape as in the list, with `status: "cancelled"` and `cancelledAt` set.

**Errors**
| Status | When |
|---|---|
| 401 | Not logged in. |
| 404 | No booking with that id. |
| 409 | Booking is already cancelled. |

The "are you sure?" confirmation is front end only.

## Login cookie

| Setting | Value |
|---|---|
| Name | `token` |
| Contents | JWT with the staff id |
| httpOnly | Yes |
| Secure | Yes in production |
| SameSite | Lax |
| Lifetime | 7 days |

---

## Assumptions

- No API versioning (`/api/v1`). There is one client, deployed with the API.
- "Today" and "tomorrow" use the hotel's time zone, decided by the API. `/availability` returns the first bookable date so the calendar and API agree.
- Availability returns all booked nights from tomorrow onward with no end date. At this scale the list is tiny.
- No maximum stay length and no limit on how far ahead a guest can book.
- Phone is free text; only "not blank" is checked.
- Guests get only the booking number back, not an id, because they can't do anything else with their booking.
- No pagination on the bookings list.
- Staff cannot un-cancel a booking.
- A login lasts 7 days with no refresh.
- No rate limiting.

## Design choices

**1. What availability returns**

| Option | Why / why not |
|---|---|
| **Booked nights (chosen)** | Matches the nights table directly, reveals no guest data, and the calendar just disables those dates. |
| Available dates | Needs an end date to stop the list, and is longer than the booked list. |
| Booked ranges (check-in/check-out) | Front end has to expand ranges, and same-day turnover is easier to get wrong. |

**2. How to cancel**

| Option | Why / why not |
|---|---|
| **`POST /bookings/:id/cancel` (chosen)** | Says exactly what it does and can't be used to change anything else. |
| `PATCH /bookings/:id` with `{ "status": "cancelled" }` | More "pure REST", but invites changing other fields and needs extra checks to block them. |
| `DELETE /bookings/:id` | Reads as "the booking is gone", but the record is kept and still listed. |

**3. Cancelling an already cancelled booking**

| Option | Why / why not |
|---|---|
| **`409` (chosen)** | Tells the staff member someone else already cancelled it, and keeps the original `cancelledAt`. |
| `200`, do nothing | Friendlier for double clicks, but hides that it was already cancelled. |

**4. Booking id or booking number in the cancel path**

| Option | Why / why not |
|---|---|
| **Database id (chosen)** | The booking number stays a display value for guests only. Staff click from the list, so they never type it. |
| Booking number | Readable URLs, but ties the URL to a value meant for people. |

**5. Double booking error**

| Option | Why / why not |
|---|---|
| **`409 Conflict` (chosen)** | The request was valid; it clashed with the current state. The front end shows "no longer available". |
| `400 Bad Request` | Would be mixed up with form mistakes. |
| `422 Unprocessable` | Possible, but `409` is the usual choice for a clash with existing data. |

**6. How the front end knows staff are logged in**

| Option | Why / why not |
|---|---|
| **Call `/bookings` and redirect to login on `401` (chosen)** | The auth guard on `/bookings` and cancel already does the check. The bookings list is the only staff page, so no extra endpoint is needed. |
| `GET /auth/me` | Answers "who am I" for things shown before data loads, like a staff name in the header. Not needed with one staff page. |
| Next.js middleware checks the cookie exists | Fast redirect, but can't tell a valid token from an expired one. Can be added on top. |

**7. Sign-up and log-in response**

| Option | Why / why not |
|---|---|
| **Staff profile in body, token only in cookie (chosen)** | The front end gets the name to show; the token stays out of JavaScript's reach. |
| Token in body too | Needed only for clients without cookies. Not needed here and less safe. |

**8. Wrong email vs wrong password**

| Option | Why / why not |
|---|---|
| **Same `401` message for both (chosen)** | Doesn't reveal which emails have accounts. |
| Separate messages | Slightly more helpful, but leaks registered emails. (Sign-up's `409` already does; accepted for open sign-up.) |

**9. Guest contact fields**

| Option | Why / why not |
|---|---|
| **Separate `guestEmail` and `guestPhone` (chosen)** | Matches the data model; email format can be checked. |
| One `contact` field | Simpler form, but can't tell an email from a phone or validate it. |

**10. Error format**

| Option | Why / why not |
|---|---|
| **NestJS default shape (chosen)** | No extra code; `ValidationPipe` already produces it. |
| Custom shape with error codes | Useful with many clients or translations. Not needed for one front end. |
