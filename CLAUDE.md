# CLAUDE.md

A simple booking web app for a single hotel with one room. Guests book nights; hotel staff sign up, log in, view all bookings and cancel them.

## Status

Planning is done. No app code exists yet. Next steps: Figma design, CI setup, then code.

## Docs

Read the relevant doc before changing anything it covers. Update the doc in the same pull request when behavior changes.

- [docs/requirements.md](docs/requirements.md): users, requirements, booking rules, User Stories 1 to 6.
- [docs/out-of-scope.md](docs/out-of-scope.md): what not to build.
- [docs/tech-stack.md](docs/tech-stack.md): frameworks, services, validation, auth, testing, env vars, CI.
- [docs/data-model.md](docs/data-model.md): MongoDB collections and fields.
- [docs/api-contract.md](docs/api-contract.md): endpoints, requests, responses, errors, login cookie.
- [docs/file-structure.md](docs/file-structure.md): folders, files, routes and conventions for both apps.

## Stack

- TypeScript in both apps.
- `web/`: Next.js (App Router), Tailwind CSS, react-day-picker, date-fns. Hosted on Vercel.
- `api/`: NestJS, Mongoose (`@nestjs/mongoose`), class-validator DTOs, `@nestjs/jwt` + bcrypt, date-fns. Hosted on Vercel.
- Database: MongoDB Atlas.
- Tests: Jest, `@nestjs/testing`, Supertest, mongodb-memory-server (`MongoMemoryReplSet`), React Testing Library.
- ESLint in each app, one Prettier config at the repo root.

## Repo layout

```
web/                 Next.js front end
api/                 NestJS back end
docs/                planning docs
.github/workflows/   CI
.prettierrc
```

`web/` never talks to the database. Next.js rewrites `/api/*` to NestJS (`API_URL`).

## Commands (planned)

Package manager is not chosen yet (npm or pnpm). Run inside `web/` or `api/`:

```
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e     # api only
```

CI runs install, lint, type check and test for both apps on every pull request and push to `main`.

## Booking rules

- One room. No two active bookings share a night.
- Same-day turnover: check-in is allowed on the previous guest's check-out day.
- Check-out must be after check-in.
- Earliest check-in is tomorrow, in the hotel's time zone.
- Guests book with name, email and phone, all required. No guest accounts.
- Only staff can cancel. Guests cannot change or cancel.
- Cancel is soft: set status to `cancelled`, set `cancelledAt` and `cancelledBy`, delete the booking's nights. The booking is kept.
- The `nights` collection has one document per booked night with the date as `_id`. It blocks double booking.
- A booking and its nights are inserted in one transaction. A duplicate night returns `409`.

## Conventions

- Dates are `YYYY-MM-DD` strings.
- API paths start with `/api`. Errors use the NestJS default shape.
- Validation runs in NestJS DTOs with a global `ValidationPipe`. Booking rules live in `bookings.service.ts`. Front end checks are for user experience only.
- Staff routes use `auth.guard.ts`, which reads the `token` cookie. A `401` in the front end redirects to `/staff/login`.
- Front end: no `src/`, no `app/api/`. Data is fetched in client components with relative `/api/...` URLs. Modals are React state, not routes.
- Components are grouped by feature: `booking/`, `auth/`, `staff/`, `shared/`.
- No shared types package. `web/lib/types.ts` repeats the API response shapes.
- Tests sit next to the file they test (`*.test.tsx` in `web/`, `*.spec.ts` in `api/`). End-to-end tests live in `api/test/`.
- `.env` files are not committed. Each app has a `.env.example` with names only.
- Write "User Story", never "US".
- Docs are facts only, kept minimal, no tradeoffs or analysis.

## Out of scope

Do not add: pricing or payments, email sending, guest accounts, multiple rooms, staff invitations, third-party sign-in, availability window, stay length limits, pagination, rate limiting.
