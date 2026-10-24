# Hotel Booking App: Data Model

## staff

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | string | Required |
| email | string | Required, unique |
| passwordHash | string | bcrypt hash |
| createdAt | Date | |

## bookings

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| bookingNumber | string | Unique, shown to guest |
| guestName | string | Required |
| guestEmail | string | Required |
| guestPhone | string | Required |
| checkIn | string | YYYY-MM-DD |
| checkOut | string | YYYY-MM-DD, after checkIn |
| status | string | active or cancelled |
| cancelledAt | Date | Set when cancelled |
| cancelledBy | ObjectId | Staff who cancelled |
| createdAt | Date | |

## nights

| Field | Type | Notes |
|---|---|---|
| _id | string | Night date, YYYY-MM-DD (unique, prevents double booking) |
| bookingId | ObjectId | The booking holding this night |

## Transactions per User Story

| User Story | Reads | Writes |
|---|---|---|
| User Story 1: Browse dates | nights from tomorrow onward | none |
| User Story 2: Book | none | Insert 1 booking + 1 nights row per night, together (fails if any night exists) |
| User Story 3: Staff sign up | staff by email (check not taken) | Insert 1 staff |
| User Story 4: Staff log in | staff by email (check password) | none |
| User Story 5: View bookings | all bookings, active and cancelled, sorted by checkIn | none |
| User Story 6: Cancel | booking by id | Set booking status to cancelled + delete its nights, together |

## Rules

- Dates are stored as `YYYY-MM-DD` strings.
- "Today" uses the hotel's time zone.
- A booking and its nights are written together in one transaction.
- Cancelling sets status to cancelled and deletes the booking's nights; the booking is kept.
- Booking number is a random 6-character code, unique.
- Guest details are stored on the booking. No guests or rooms collections.
- All staff accounts are equal; there are no roles.
