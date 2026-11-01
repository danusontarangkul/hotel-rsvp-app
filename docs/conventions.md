# Hotel Booking App: Conventions

## Front end

- No `src/` folder.
- Components make API requests through hooks in `hooks/`, which call `lib/api.ts`; components don't import `lib/api.ts` request functions.
- Tailwind CSS v4 is set up in `app/globals.css`; no `tailwind.config.ts`.
- No `app/api/` folder; all `/api/*` requests go through the rewrite to NestJS.
- All data is fetched in client components with relative `/api/...` URLs.
- The booking form is a side panel next to the calendar (stacked under it on small screens), not a modal. `BookingSection` holds the selected dates and the booking request. The confirmation and the "no longer available" message are shown in `BookingModal`.
- Modals are React state on the page, not routes. `shared/Modal.tsx` is the base modal for `BookingModal` and `CancelBookingModal`.
- `shared/SiteHeader.tsx` is added per page, not in `layout.tsx`. On `/` it has `HomeHeaderActions`: a skeleton while `GET /api/auth/me` loads, then the `LogoutButton` if staff are logged in, otherwise a "Staff log in" link (also if the check fails); on `/staff/bookings` it has a "Bookings" `NavLink` and the `LogoutButton`. Sign up and log in have no header. No footer. No `/staff` index page. No separate staff layout.
- Log out always goes to `/`, even if the request fails. On `/` itself, `HomeHeaderActions` passes `onLoggedOut={refetch}` so the header re-checks `GET /api/auth/me` and switches back to "Staff log in".
- Staff pages call `useRedirectOnUnauthorized(...errors)` so a `401` from any of their requests goes to `/staff/login`. Forms that expect a `401` (log in) don't use it.
- Tables use `shared/Table.tsx`, `shared/TableRow.tsx` and `shared/TableCell.tsx`. On screens narrower than `lg` each row shows as a card: the header row is hidden and each `TableCell` shows its `label`. Nothing scrolls sideways.
- `components/shared/` holds only generic pieces with no booking or staff logic.
- The chat history lives in `useChat` state only and is sent in full with each message.
- No `loading.tsx`, `error.tsx` or middleware.
- Tests (`*.test.tsx`, `*.test.ts`) sit next to the file they test and run with Jest and React Testing Library.

## Back end

- `app.setup.ts` (`configureApp`) sets the global `/api` prefix, `cookie-parser` and the global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`, `stopAtFirstError`). `main.ts` and the e2e tests both call it, so tests run the same app.
- E2e tests start one `MongoMemoryReplSet` in `test/global-setup.ts`, which sets `MONGODB_URI` and `JWT_SECRET` before the app loads (so a local `.env` is never used), and build the app with `createTestApp()` from `test/app.e2e.ts`.
- `app.module.ts` loads `@nestjs/config` and connects Mongoose with `MONGODB_URI`.
- `auth.guard.ts` (`AuthGuard`) reads the `token` cookie, checks the JWT and returns `401` if it is missing or not valid. It also puts the staff id from the token on the request, and `@CurrentStaffId()` (`current-staff-id.decorator.ts`) reads it in a route. Staff-only routes add `@UseGuards(AuthGuard)`. `AuthModule` exports `JwtModule`, and `BookingsModule` imports `AuthModule` so the guard can use it.
- `booking-response.ts` (`toBookingResponse`) turns a saved booking into the API shape. Every endpoint that returns a booking uses it.
- `staff/` has no controller; only `auth/` uses it.
- `chat/` calls `BookingsService` for every tool, so chat bookings and cancels follow the same rules as the other endpoints. `BookingsModule` exports `BookingsService` for it.
- `chat-faq.ts` (`CHAT_FAQ`) is the FAQ text sent to the model with every request. Edit it there when booking rules change.
- `optional-auth.guard.ts` (`OptionalAuthGuard`) reads the `token` cookie like `AuthGuard` but never returns `401`; with no valid cookie, `staffId` is left unset and the chat treats the user as a guest.
- Booking rules live in `bookings.service.ts`.
- "Now" comes from the injected `CLOCK` provider (`common/clock.ts`), never `new Date()` in a service. Tests replace it with a fixed time: unit tests provide their own `CLOCK`, and e2e tests call `createTestApp({ now })`.
- No shared types package; `web/lib/types.ts` repeats the API response shapes.
- Unit tests (`*.spec.ts`) sit next to the file they test. End-to-end tests live in `test/` and run against mongodb-memory-server.
