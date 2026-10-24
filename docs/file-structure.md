# Hotel Booking App: File Structure

One repo with the Next.js front end (`web/`) and the NestJS back end (`api/`):

```
hotel-app/
├── web/
├── api/
├── .github/workflows/
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
│       ├── Modal.tsx
│       ├── TextInput.tsx
│       └── ErrorMessage.tsx
├── lib/
│   ├── api.ts
│   ├── api.test.ts
│   ├── types.ts
│   ├── dates.ts
│   └── dates.test.ts
├── next.config.ts
├── .env.example
├── jest.config.ts
├── jest.setup.ts
├── tailwind.config.ts
├── eslint.config.mjs
└── tsconfig.json
```

Tests (`*.test.tsx`, `*.test.ts`) sit next to the file they test and run with Jest and React Testing Library. Simple display pieces (`BookingConfirmation`, `LogoutButton`, `shared/`) have no tests of their own; they are covered by the tests of the components that use them.

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
├── .env.example
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

---

## Assumptions

### Front end

- No `src/` folder; `app/`, `components/` and `lib/` sit at the top of `web/`.
- No `app/api/` folder. All `/api/*` requests go through the rewrite to NestJS, and a Next.js route handler there would get in the way.
- All data is fetched in the browser (client components) with relative `/api/...` URLs. Pages themselves are thin wrappers around the components.
- The booking confirmation is shown in the booking modal from the POST `/api/bookings` response. Refreshing the page closes the modal and clears it.
- Modals are plain React state on the page, not routes, so they have no URL.
- `shared/Modal.tsx` is the one base modal (overlay, close button, Escape to close); `BookingModal` and `CancelBookingModal` are built on it.
- Staff find the login page through a small footer link; there is no `/staff` index page.
- Logged-in staff who open login or sign-up still see the form (there is no `/me` to check).
- The log-out button lives on the bookings page, since it is the only logged-in page. No separate staff layout.
- No `loading.tsx` or `error.tsx`. Each component shows its own loading and error text. Unknown URLs use the Next.js default 404.
- No middleware (called `proxy.ts` in newer Next.js); see tradeoff 5.

### Back end

- `main.ts` sets the global `/api` prefix, `cookie-parser` and the global `ValidationPipe`.
- `app.module.ts` loads `@nestjs/config` and connects Mongoose with `MONGODB_URI`.
- `.env.example` lists `MONGODB_URI`, `JWT_SECRET` and `PORT`.
- `auth.guard.ts` reads the `token` cookie and is used on the two staff-only booking endpoints.
- `staff/` has no controller; only `auth/` uses it.
- The booking rules (dates, no booked nights, transaction with the nights) live in `bookings.service.ts`, not the controllers.
- No shared types package between `web/` and `api/`; `web/lib/types.ts` repeats the response shapes from the API contract.

## Tradeoffs

### Front end

**1. Where the confirmation is shown**

| Option | Why / why not |
|---|---|
| **In the booking modal on the home page (chosen)** | The guest never leaves the calendar, no extra route. A refresh loses the booking number, so the guest should note it down. |
| Separate `/confirmation` page with query params | Survives a refresh, but adds a route for one message. |

**2. How modals are built**

| Option | Why / why not |
|---|---|
| **React state on the page (chosen)** | A few lines per modal and no extra files in `app/`. The modal has no URL, which is fine for a short form and a yes/no question. |
| Next.js intercepting and parallel routes (`@modal`, `(.)book`) | The modal gets its own URL and survives a refresh, but adds several special folders and is easy to get wrong. |
| Browser `confirm()` for cancel | No code, but can't be styled and looks different on every browser. |

**3. Staff URLs**

| Option | Why / why not |
|---|---|
| **`/staff/...` prefix (chosen)** | Clear split between the guest page and staff pages, one prefix to protect if middleware is added later, and `/staff/bookings` isn't confused with `/api/bookings`. |
| Route groups `(guest)` / `(staff)` with no prefix (`/login`, `/bookings`) | Shorter URLs, but nothing in the URL says it's for staff. |

**4. Fetching data: client or server components**

| Option | Why / why not |
|---|---|
| **Client components with relative `/api` URLs (chosen)** | One path for every call through the rewrite; the browser sends the login cookie by itself. The calendar and forms need to be client components anyway. |
| Server components | Data arrives with the first page load, but server code can't use the rewrite: it must call `API_URL` directly and pass the cookie along by hand. More moving parts for no real gain at this size. |

**5. Keeping logged-out staff off the bookings page**

| Option | Why / why not |
|---|---|
| **Redirect on `401` from `/api/bookings` (chosen)** | Matches the API contract; the API's guard is the real check. Downside: a brief loading state before the redirect. |
| Middleware checks the `token` cookie exists | Instant redirect, but can't tell a valid token from an expired one. Can be added on top later. |

**6. How components are organized**

| Option | Why / why not |
|---|---|
| **`components/` grouped by feature, plus `shared/` (chosen)** | Each feature's pieces sit together, and buttons and inputs look the same everywhere. |
| One flat `components/` folder | Fine for a handful of files, but harder to scan as it grows. |
| Colocated `_components/` folders inside each route | Keeps components next to their page, but `auth/` serves three routes, so it wouldn't have one home. |

**7. Guest home URL**

| Option | Why / why not |
|---|---|
| **Calendar at `/` (chosen)** | Booking is the only thing guests do, so it's the first thing they see. |
| `/` as a landing page, calendar at `/book` | Room for hotel info, which isn't in scope. |

**8. Sign-up and log-in pages**

| Option | Why / why not |
|---|---|
| **Two pages (chosen)** | One per User Story; each links to the other. |
| One page with tabs | One less route, but more state in one component. |

**9. Where front end tests live**

| Option | Why / why not |
|---|---|
| **Next to the file they test (chosen)** | Easy to see what is tested and what isn't, and moving a component moves its test. |
| A separate `__tests__/` folder | Keeps component folders shorter, but tests drift away from the code they check. |

### Back end

**10. How the API is split up**

| Option | Why / why not |
|---|---|
| **One folder per feature: `auth/`, `staff/`, `bookings/` (chosen)** | The NestJS convention; each feature's controller, service, schema and DTOs sit together. Matches the front end's feature folders. |
| Folders per layer: `controllers/`, `services/`, `schemas/` | Familiar from other frameworks, but one feature is spread across many folders and NestJS modules don't map to it. |

**11. Where availability lives**

| Option | Why / why not |
|---|---|
| **`availability.controller.ts` inside `bookings/` (chosen)** | Availability is just a read of the nights, which `bookings/` already owns. No second module needs the nights model. |
| Its own `availability/` module | Mirrors the URL, but has to borrow the nights model from `bookings/`. |

**12. Staff and auth**

| Option | Why / why not |
|---|---|
| **Separate `staff/` and `auth/` modules (chosen)** | Follows the NestJS auth recipe: `staff/` stores staff, `auth/` handles passwords, tokens and the guard. |
| One `auth/` module that also owns the staff schema | One less module, but mixes storing staff with logging them in. |

**13. Types shared between web and api**

| Option | Why / why not |
|---|---|
| **Each app has its own types (chosen)** | No extra package or build setup; the API contract is small and fixed. |
| A shared `packages/types` folder with npm or pnpm workspaces | One source of truth, but needs workspace setup and both hosts must build it. |
