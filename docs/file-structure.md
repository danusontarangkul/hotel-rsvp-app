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
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── AvailabilityCalendar.test.tsx
│   │   ├── BookingModal.tsx
│   │   ├── BookingModal.test.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingForm.test.tsx
│   │   └── BookingConfirmation.tsx
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   ├── SignupForm.test.tsx
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── LogoutButton.tsx
│   ├── staff/
│   │   ├── BookingsTable.tsx
│   │   ├── BookingsTable.test.tsx
│   │   ├── CancelBookingModal.tsx
│   │   └── CancelBookingModal.test.tsx
│   └── shared/
│       ├── Button.tsx
│       ├── Button.test.tsx
│       ├── Card.tsx
│       ├── Card.test.tsx
│       ├── icons.tsx
│       ├── icons.test.tsx
│       ├── PasswordInput.tsx
│       ├── PasswordInput.test.tsx
│       ├── TextLink.tsx
│       ├── TextLink.test.tsx
│       ├── Modal.tsx
│       ├── TextInput.tsx
│       ├── TextInput.test.tsx
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
│   ├── useSignup.ts
│   ├── useSignup.test.ts
│   ├── useLogin.ts
│   ├── useLogin.test.ts
│   ├── useCreateBooking.ts
│   ├── useCreateBooking.test.ts
│   ├── useCancelBooking.ts
│   └── useCancelBooking.test.ts
├── lib/
│   ├── api.ts
│   ├── api.test.ts
│   ├── types.ts
│   ├── form-errors.ts
│   ├── form-errors.test.ts
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

- `/` → pick dates → booking modal opens with the form → book → the same modal shows the booking number and dates → close → calendar shows the new dates blocked.
- On a booking `409`, the modal shows "no longer available"; closing it reloads availability.
- `/staff/bookings` → Cancel on a row → confirmation modal → confirm → row shows as cancelled. Closing the modal does nothing.
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
│   ├── auth/
│   │   ├── auth.module.ts
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
│   │   └── staff.schema.ts
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
│       ├── dates.ts
│       └── dates.spec.ts
├── test/
│   ├── auth.e2e-spec.ts
│   ├── bookings.e2e-spec.ts
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
- The booking confirmation is shown in the booking modal.
- Modals are React state on the page, not routes. `shared/Modal.tsx` is the base modal for `BookingModal` and `CancelBookingModal`.
- A header link leads to the staff login page. No footer. No `/staff` index page.
- The log-out button is on the bookings page. No separate staff layout.
- No `loading.tsx`, `error.tsx` or middleware.

### Back end

- `main.ts` sets the global `/api` prefix, `cookie-parser` and the global `ValidationPipe`.
- `app.module.ts` loads `@nestjs/config` and connects Mongoose with `MONGODB_URI`.
- `auth.guard.ts` reads the `token` cookie and guards the two staff-only booking endpoints.
- `staff/` has no controller; only `auth/` uses it.
- Booking rules live in `bookings.service.ts`.
- No shared types package; `web/lib/types.ts` repeats the API response shapes.
