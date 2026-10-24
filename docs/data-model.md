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

## Why nights has its own table

The one rule the database must never break is "no two bookings share a night", even when two guests submit at the same moment.

MongoDB has no built-in way to say "these date ranges must not overlap". It can, however, guarantee that a value is unique. Storing each booked night as its own row, with the date as its unique id, turns "no overlapping stays" into "no duplicate dates", which MongoDB enforces itself. The booking and its nights are saved together, so if any night is taken, nothing is saved and the guest is told the dates are gone.

It also makes the guest calendar simple: the booked dates are just the nights rows from tomorrow onward.

**Alternatives considered**

| Option | How it works | Why not chosen |
|---|---|---|
| Check, then insert | Store only checkIn/checkOut on the booking. Before saving, look for an overlapping booking. | Two requests can both check, both see "free", and both save. This is the race the nights table exists to stop. |
| Nights list inside the booking | The booking holds a list of its night dates, with a unique index on that list. | Works too, with one table and no transaction. Rejected because cancelling must remember to empty the list, and the rule is easier to see and test as separate rows. A reasonable choice if you want fewer tables. |
| One "room" record as a lock | Every booking first updates a single shared record, so bookings happen one at a time. | Works, but more moving parts and easy to get subtly wrong. |

**Tradeoffs of the nights table**

- More rows: a 4-night stay is 5 inserts (1 booking + 4 nights). At this scale that costs nothing.
- The same dates are stored twice (checkIn/checkOut on the booking, and the nights rows). They must always agree, which is why they're only ever written together.
- Saving them together needs a transaction, which needs a replica set. Atlas, including the free tier, has one; local tests use the in-memory replica set.

## Other debatable choices

| Choice | Chosen | Alternative | Tradeoff |
|---|---|---|---|
| Date format | Text, YYYY-MM-DD | Date type | Text avoids time zone bugs that shift a stay by a day. You lose built-in date maths, so the app must check the format. |
| What counts as "today" | Hotel's own time zone | Server's time zone | Hosting servers usually run on UTC, which can block or allow the wrong day near midnight. Pick the hotel's time zone once and use it everywhere. |
| Cancelling | Mark as cancelled, delete its nights | Delete the booking | Required now that staff view cancelled bookings (User Story 5). Costs 3 extra fields. |
| Guest details | Stored on the booking | Separate guests table | No guest accounts, so a guests table adds nothing. A repeat guest's details are just stored again. |
| Guest contact | Separate email and phone fields | One "contact" field | Each can be checked properly (email format). |
| Rooms | No rooms table | Rooms table | Simpler for one room. Adding rooms later means adding a room to bookings and nights and making room + date unique. |
| Booking number | Random 6-character code | Counting up (1, 2, 3) | Can't be guessed and doesn't reveal how many bookings exist. Needs a unique index and a retry in the rare case of a clash. |
| Staff roles | None, every staff account is equal | Admin / staff roles | Fits open sign-up. Anyone who signs up can cancel any booking, which is accepted for this small app. |
| Database | MongoDB (stack choice) | PostgreSQL | Postgres can forbid overlapping date ranges directly, so it wouldn't need a nights table. MongoDB was chosen for the stack, and the nights table covers the gap. |
