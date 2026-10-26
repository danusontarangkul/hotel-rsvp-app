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
| 409 | Any night of the stay is already booked. |

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

## Notes

- No API versioning.
- "Today" and "tomorrow" use the hotel's time zone.
- No maximum stay length and no limit on how far ahead a guest can book.
- Phone is stored as sent; the API only checks "not blank". The web app sends 10 digits with no formatting (e.g. `5550100123`) and formats them as `(555) 010-0123` for display.
- No pagination on the bookings list.
- Staff cannot un-cancel a booking.
- No rate limiting.
