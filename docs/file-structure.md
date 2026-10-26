# Hotel Booking App: File Structure

One repo with the Next.js front end (`web/`) and the NestJS back end (`api/`):

```
hotel-app/
├── web/
├── api/
├── .github/
│   └── workflows/
│       └── ci.yml
└── .prettierrc
```

## Front end: web/

### Directory tree

```
web/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   └── staff/
│       ├── signup/
│       │   └── page.tsx
│       ├── login/
│       │   └── page.tsx
│       └── bookings/
│           └── page.tsx
├── components/
│   ├── booking/
│   │   ├── BookingSection.tsx
│   │   ├── BookingSection.test.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── AvailabilityCalendar.test.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingForm.test.tsx
│   │   ├── BookingModal.tsx
│   │   ├── BookingModal.test.tsx
│   │   ├── BookingConfirmation.tsx
│   │   └── BookingConfirmation.test.tsx
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   ├── SignupForm.test.tsx
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   ├── LogoutButton.tsx
│   │   └── LogoutButton.test.tsx
│   ├── staff/
│   │   ├── BookingsSection.tsx
│   │   ├── BookingsSection.test.tsx
│   │   ├── BookingsTable.tsx
│   │   ├── BookingsTable.test.tsx
│   │   ├── BookingStatusBadge.tsx
│   │   ├── BookingStatusBadge.test.tsx
│   │   ├── CancelBookingModal.tsx
│   │   ├── CancelBookingModal.test.tsx
│   │   └── testBookings.ts
│   └── shared/
│       ├── Actions.tsx
│       ├── Actions.test.tsx
│       ├── Button.tsx
│       ├── Button.test.tsx
│       ├── Card.tsx
│       ├── Card.test.tsx
│       ├── icons.tsx
│       ├── icons.test.tsx
│       ├── PhoneInput.tsx
│       ├── PhoneInput.test.tsx
│       ├── PasswordInput.tsx
│       ├── PasswordInput.test.tsx
│       ├── TextLink.tsx
│       ├── TextLink.test.tsx
│       ├── LoadingMessage.tsx
│       ├── LoadError.tsx
│       ├── LoadError.test.tsx
│       ├── LoadingMessage.test.tsx
│       ├── Modal.tsx
│       ├── Modal.test.tsx
│       ├── NavLink.tsx
│       ├── NavLink.test.tsx
│       ├── SectionHeading.tsx
│       ├── SectionHeading.test.tsx
│       ├── SiteHeader.tsx
│       ├── SiteHeader.test.tsx
│       ├── Skeleton.tsx
│       ├── Skeleton.test.tsx
│       ├── Table.tsx
│       ├── Table.test.tsx
│       ├── TableSkeleton.tsx
│       ├── TableSkeleton.test.tsx
│       ├── TextInput.tsx
│       ├── TextInput.test.tsx
│       ├── EmailInput.tsx
│       ├── EmailInput.test.tsx
│       ├── EmptyState.tsx
│       ├── EmptyState.test.tsx
│       ├── ErrorMessage.tsx
│       ├── ErrorMessage.test.tsx
│       ├── Form.tsx
│       ├── Form.test.tsx
│       ├── Page.tsx
│       ├── Page.test.tsx
│       ├── PageHeading.tsx
│       ├── PageHeading.test.tsx
│       ├── Spinner.tsx
│       └── Spinner.test.tsx
├── hooks/
│   ├── useApiMutation.ts
│   ├── useApiMutation.test.ts
│   ├── useApiQuery.ts
│   ├── useApiQuery.test.ts
│   ├── useAvailability.ts
│   ├── useAvailability.test.ts
│   ├── useBookings.ts
│   ├── useBookings.test.ts
│   ├── useSignup.ts
│   ├── useSignup.test.ts
│   ├── useLogin.ts
│   ├── useLogin.test.ts
│   ├── useCreateBooking.ts
│   ├── useCreateBooking.test.ts
│   ├── useCancelBooking.ts
│   ├── useCancelBooking.test.ts
│   ├── useLogout.ts
│   ├── useLogout.test.ts
│   ├── useRedirectOnUnauthorized.ts
│   └── useRedirectOnUnauthorized.test.ts
├── lib/
│   ├── api.ts
│   ├── api.test.ts
│   ├── types.ts
│   ├── mock-bookings.ts
│   ├── mock-bookings.test.ts
│   ├── form-errors.ts
│   ├── form-errors.test.ts
│   ├── phone.ts
│   ├── phone.test.ts
│   ├── validation.ts
│   ├── validation.test.ts
│   ├── dates.ts
│   └── dates.test.ts
├── next.config.ts
├── jest.config.ts
├── jest.setup.ts
├── eslint.config.mjs
├── AGENTS.md
├── CLAUDE.md
└── tsconfig.json
```

Tests (`*.test.tsx`, `*.test.ts`) sit next to the file they test and run with Jest and React Testing Library.

### Component folders

| Folder | Used by |
|---|---|
| `booking/` | `/` (User Story 1, User Story 2) |
| `auth/` | `/staff/signup`, `/staff/login`, log out on `/staff/bookings` (User Story 3, User Story 4) |
| `staff/` | `/staff/bookings` (User Story 5, User Story 6) |
| `shared/` | Any page. Only generic pieces with no booking or staff logic. |

### Routes

| URL | Who | User Story | API calls |
|---|---|---|---|
| `/` | Guest | User Story 1, User Story 2 | GET `/api/availability`, POST `/api/bookings` |
| `/staff/signup` | Staff | User Story 3 | POST `/api/auth/signup` |
| `/staff/login` | Staff | User Story 4 | POST `/api/auth/login` |
| `/staff/bookings` | Staff (logged in) | User Story 4, 5, 6 | GET `/api/bookings`, POST `/api/bookings/:id/cancel`, POST `/api/auth/logout` |

### Page flow

- `/` → pick a check-in then a check-out on the calendar → the "Your stay" panel beside it shows the dates and the guest details form → book → a modal shows the booking number and dates → close → the form clears and the calendar reloads with the new dates blocked.
- On a booking `409`, a modal shows "Dates no longer available" with the API message; closing it clears the dates (the guest details stay filled in) and reloads availability.
- `/staff/bookings` → "Cancel booking" on a row → "Cancel this booking?" modal → "Cancel booking" → the list reloads and the row shows as cancelled. "Keep booking", ×, Escape or a click outside closes the modal and changes nothing.
- `/staff/signup` or `/staff/login` → success → `/staff/bookings`
- `/staff/bookings` → `401` from the API → `/staff/login`
- Log out → `/staff/login`

## Back end: api/

### Directory tree

```
api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.setup.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.constants.ts
│   │   ├── auth.types.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.guard.ts
│   │   └── dto/
│   │       ├── signup.dto.ts
│   │       └── login.dto.ts
│   ├── staff/
│   │   ├── staff.module.ts
│   │   ├── staff.service.ts
│   │   ├── staff.service.spec.ts
│   │   ├── staff.schema.ts
│   │   └── staff.types.ts
│   ├── bookings/
│   │   ├── bookings.module.ts
│   │   ├── bookings.controller.ts
│   │   ├── availability.controller.ts
│   │   ├── bookings.service.ts
│   │   ├── bookings.service.spec.ts
│   │   ├── booking.schema.ts
│   │   ├── night.schema.ts
│   │   ├── booking-number.ts
│   │   └── dto/
│   │       └── create-booking.dto.ts
│   └── common/
│       ├── constants.ts
│       ├── dates.ts
│       ├── dates.spec.ts
│       ├── email.ts
│       ├── email.spec.ts
│       ├── mongo-errors.ts
│       ├── mongo-errors.spec.ts
│       ├── transforms.ts
│       └── transforms.spec.ts
├── test/
│   ├── app.e2e.ts
│   ├── auth.e2e-spec.ts
│   ├── bookings.e2e-spec.ts
│   ├── global-setup.ts
│   ├── global-teardown.ts
│   └── jest-e2e.json
├── nest-cli.json
├── eslint.config.mjs
├── tsconfig.json
└── tsconfig.build.json
```

Unit tests (`*.spec.ts`) sit next to the file they test. End-to-end tests live in `test/` and run against mongodb-memory-server.

### Modules

| Module | Endpoints | Collections | User Story |
|---|---|---|---|
| `auth/` | POST `/api/auth/signup`, `/login`, `/logout` | via `staff/` | User Story 3, User Story 4 |
| `staff/` | None | staff | User Story 3, User Story 4 |
| `bookings/` | GET `/api/availability`, POST `/api/bookings`, GET `/api/bookings`, POST `/api/bookings/:id/cancel` | bookings, nights | User Story 1, 2, 5, 6 |
| `common/` | None | None | Hotel time zone "today/tomorrow" and nights-between-dates helpers |

## Conventions

### Front end

- No `src/` folder.
- Components make API requests through hooks in `hooks/`, which call `lib/api.ts`; components don't import `lib/api.ts` request functions.
- Tailwind CSS v4 is set up in `app/globals.css`; no `tailwind.config.ts`.
- No `app/api/` folder; all `/api/*` requests go through the rewrite to NestJS.
- All data is fetched in client components with relative `/api/...` URLs.
- The booking form is a side panel next to the calendar (stacked under it on small screens), not a modal. `BookingSection` holds the selected dates and the booking request. The confirmation and the "no longer available" message are shown in `BookingModal`.
- Modals are React state on the page, not routes. `shared/Modal.tsx` is the base modal for `BookingModal` and `CancelBookingModal`.
- `shared/SiteHeader.tsx` is added per page, not in `layout.tsx`. On `/` it has a "Staff log in" link; on `/staff/bookings` it has a "Bookings" `NavLink` and the `LogoutButton`. Sign up and log in have no header. No footer. No `/staff` index page. No separate staff layout.
- Log out always goes to `/staff/login`, even if the request fails.
- Staff pages call `useRedirectOnUnauthorized(...errors)` so a `401` from any of their requests goes to `/staff/login`. Forms that expect a `401` (log in) don't use it.
- Tables use `shared/Table.tsx` (`Table`, `TableRow`, `TableCell`). On screens narrower than `lg` each row shows as a card: the header row is hidden and each `TableCell` shows its `label`. Nothing scrolls sideways.
- No `loading.tsx`, `error.tsx` or middleware.

### Back end

- `app.setup.ts` (`configureApp`) sets the global `/api` prefix, `cookie-parser` and the global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`, `stopAtFirstError`). `main.ts` and the e2e tests both call it, so tests run the same app.
- E2e tests start one `MongoMemoryReplSet` in `test/global-setup.ts`, which sets `MONGODB_URI` and `JWT_SECRET` before the app loads (so a local `.env` is never used), and build the app with `createTestApp()` from `test/app.e2e.ts`.
- `app.module.ts` loads `@nestjs/config` and connects Mongoose with `MONGODB_URI`.
- `auth.guard.ts` reads the `token` cookie and guards the two staff-only booking endpoints.
- `staff/` has no controller; only `auth/` uses it.
- Booking rules live in `bookings.service.ts`.
- No shared types package; `web/lib/types.ts` repeats the API response shapes.
