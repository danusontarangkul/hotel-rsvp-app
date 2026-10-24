# Hotel Booking App: Tech Stack and Tools

Companion to [requirements.md](requirements.md). Sized for a small weekend build: one hotel, one room, two kinds of users, nobody really using it in production.

## Architecture

Two apps in one GitHub repository:

- **`web/`: Next.js front end.** Pages for the calendar, booking form, confirmation, staff sign-up/login and bookings list. It never talks to the database directly; it calls the API.
- **`api/`: NestJS back end.** All booking rules, staff auth and database access live here.

```
Browser ──> Next.js (Vercel) ──/api/* rewrite──> NestJS (Render or Railway) ──> MongoDB Atlas
```

Next.js forwards `/api/*` requests to NestJS with a [rewrite](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) in `next.config`. The browser then only ever talks to one domain, which means no CORS setup and the login cookie just works.

## Stack at a glance

| Area | Choice | Notes |
|---|---|---|
| Language | TypeScript | Both apps. |
| Front end | Next.js (App Router) | Hosted on Vercel. |
| Styling | Tailwind CSS | Phone and desktop layouts. |
| Calendar UI | react-day-picker | Date range picker with disabled dates. |
| Back end | NestJS | Hosted on Render or Railway (both have free or cheap tiers). |
| Validation | NestJS DTOs + class-validator + class-transformer | Server-side checks, see below. |
| Database | MongoDB Atlas (free tier) | Hosted MongoDB. |
| Data access | Mongoose via `@nestjs/mongoose` | Schemas for bookings, nights and staff. |
| Auth | `@nestjs/jwt` + bcrypt, JWT in an httpOnly cookie | See the Auth section. |
| Dates | date-fns | Night counting and date comparisons. Used in both apps. |
| Testing | Jest, `@nestjs/testing`, Supertest, mongodb-memory-server, React Testing Library | See the Testing section. |
| Linting and formatting | ESLint + Prettier | Both apps come with ESLint; NestJS also comes with Prettier. |
| Config | Environment variables | See below. |
| Hosting | Vercel (web) + Render or Railway (api) | |
| Version control | Git + GitHub | One repo, two folders. |
| CI | GitHub Actions | Lint, type check and test both apps. |
| Design | Figma | Optional for about four screens. |
| AI coding | Claude Code | Hand it the requirements file and this document. |
| Runtime and packages | Node.js (LTS) + npm or pnpm | Pick one package manager for both apps. |

## Validation: front end or back end?

**The required checks are back end checks, done in NestJS.** Anyone can skip the front end and call the API directly, so the API must reject bad input itself.

In NestJS this is done with **DTOs** (data transfer objects) plus **class-validator** decorators and a global `ValidationPipe`. NestJS does not validate DTOs on its own; you install `class-validator` and `class-transformer` and turn on the pipe in `main.ts`. Example:

```ts
export class CreateBookingDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsDateString() checkIn: string;   // YYYY-MM-DD
  @IsDateString() checkOut: string;
}
```

Checks the DTO handles: name present, email format, password at least 8 characters (`@MinLength(8)`), dates are valid dates.

Checks that belong in the booking service, not the DTO: phone **or** email present, check-out after check-in, no past dates, no booked nights. These compare fields or need the database.

**Front end checks are optional, for a nicer experience only:** `required` and `minLength` on inputs, and the calendar disabling past and booked dates. No Zod needed.

## Auth

**Simplest option for this app: email and password in NestJS, following the official NestJS [authentication recipe](https://docs.nestjs.com/security/authentication).**

- **Sign up:** hash the password with **bcrypt** and save the staff member.
- **Log in:** compare with bcrypt, then create a token with **`@nestjs/jwt`** and send it back as an **httpOnly cookie**.
- **Protect staff routes:** a small `AuthGuard` that reads the cookie and checks the token. Put it on the bookings list and cancel endpoints.
- **Log out:** clear the cookie.

This is roughly 100 lines and no outside services. Passport (`@nestjs/passport`) is optional; the NestJS recipe works without it.

On the Next.js side, staff pages call the API; if the API returns 401, redirect to the login page. Next.js middleware can also check that the cookie exists for a quick redirect.

### What about Google sign-in?

If you meant "Sign in with Google" (for example with Auth.js / NextAuth's Google provider): **yes, you have to set it up in Google Cloud.** You create a project in the Google Cloud Console, configure the OAuth consent screen, and create an OAuth client ID and secret with your callback URLs (one for localhost, one for production). It's free and takes about 15 minutes.

It doesn't fit this app well, though:
- The requirements say staff sign up with name, email and password.
- With Google sign-in on Next.js and the API on NestJS, NestJS still has to verify who is calling, so you end up writing auth on both sides.

Stick with email and password in NestJS.

## Database: MongoDB Atlas

- Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), a database user, and allow network access from your API host.
- NestJS connects with `MongooseModule.forRoot(process.env.MONGODB_URI)`.
- Because NestJS runs as a normal long-running server (not serverless), one connection is opened at start-up; no special connection caching is needed.

### Preventing double bookings

Two guests can submit the same dates at the same moment (User Story 2). A simple, reliable way to stop that:
- Keep a `nights` collection with one document per booked night and a **unique index on the date**.
- When booking, insert the booking and one document per night of the stay inside a **transaction** (Atlas supports these). If any night already exists, the unique index rejects it, the transaction rolls back, and the API returns 409, which the front end shows as "no longer available".
- Cancelling deletes the booking and its nights in one transaction.
- Same-day turnover works automatically: a Mon to Wed stay books the nights of Mon and Tue, so Wed is free for the next check-in.

Store dates as plain `YYYY-MM-DD` strings (no times, no time zones) to avoid off-by-one-day bugs.

## Testing

### NestJS (api)
NestJS comes set up for testing; `nest new` generates it all.
- **Jest**: the test runner.
- **`@nestjs/testing`**: builds a test version of your module so you can test services and controllers, and swap in fakes.
- **Supertest**: end-to-end tests that send real HTTP requests to the app (for example: book a stay, try to book the same night again and get 409, log in, cancel).

### MongoDB
- **mongodb-memory-server**: starts a throwaway MongoDB in memory for each test run, so tests never touch Atlas. Pass its URI to `MongooseModule.forRoot` in the test module. Use its replica set mode (`MongoMemoryReplSet`) so transactions work.

### Next.js (web)
- **Jest** with the `next/jest` preset and **React Testing Library** for components like the booking form and calendar.
- Optional: **Playwright** for one or two full browser tests across both apps.

Most bugs will be in the booking rules, so put most tests on the NestJS booking service.

## Linting and formatting

- **ESLint** in both apps (`create-next-app` and `nest new` both set it up).
- **Prettier** with one shared config at the repo root so both apps format the same way.

## Environment variables

Keep secrets in `.env` files locally (never committed; add them to `.gitignore`) and in each host's settings.

| App | Variable | Purpose |
|---|---|---|
| api | `MONGODB_URI` | Atlas connection string. |
| api | `JWT_SECRET` | Signs login tokens. A long random string. |
| api | `PORT` | Set by Render or Railway. |
| web | `API_URL` | Where the `/api/*` rewrite forwards to (for example `http://localhost:3001` locally). |

Use `@nestjs/config` to read them in NestJS. Commit a `.env.example` with the names but no values.

## GitHub Actions

One workflow on every pull request and push to `main`, running for both `web/` and `api/`:
1. Install dependencies.
2. Lint.
3. Type check (`tsc --noEmit`).
4. Test.

Vercel deploys `web/` from GitHub on its own (set the project's root directory to `web`), and Render or Railway deploys `api/` from GitHub on its own (root directory `api`). No deploy step is needed in GitHub Actions.

## Design

Figma is optional. There are about four screens: calendar and booking form, booking confirmation, staff sign-up/login, and bookings list. A quick sketch is enough unless you want Figma practice.

## Final list

**Both:** Git, GitHub, GitHub Actions, TypeScript, Node.js, ESLint, Prettier, date-fns, Jest, Claude Code, Figma (optional)

**web/:** Next.js, Tailwind CSS, react-day-picker, React Testing Library, Vercel

**api/:** NestJS, class-validator, class-transformer, `@nestjs/config`, `@nestjs/mongoose`, Mongoose, `@nestjs/jwt`, bcrypt, cookie-parser, `@nestjs/testing`, Supertest, mongodb-memory-server, Render or Railway

**Database:** MongoDB Atlas
