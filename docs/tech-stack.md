# Hotel Booking App: Tech Stack and Tools

## Architecture

Two apps in one GitHub repository:

- **`web/`**: Next.js front end. Calls the API; never talks to the database directly.
- **`api/`**: NestJS back end. Booking rules, staff auth and database access.

```
Browser ──> Next.js (Vercel) ──/api/* rewrite──> NestJS (Vercel) ──> MongoDB Atlas
```

Next.js forwards `/api/*` to NestJS with a rewrite in `next.config`.

## Stack

| Area | Choice |
|---|---|
| Language | TypeScript (both apps) |
| Front end | Next.js (App Router), hosted on Vercel |
| Styling | Tailwind CSS |
| Calendar UI | react-day-picker |
| Back end | NestJS 11 (not 12, which switches to Vitest and oxlint), hosted on Vercel |
| Validation | NestJS DTOs + class-validator + class-transformer |
| Database | MongoDB Atlas (free tier) |
| Data access | Mongoose via `@nestjs/mongoose` |
| Auth | `@nestjs/jwt` + bcrypt, JWT in an httpOnly cookie |
| Dates | date-fns (both apps) |
| Testing | Jest, `@nestjs/testing`, Supertest, mongodb-memory-server, React Testing Library |
| Linting and formatting | ESLint + Prettier |
| Config | Environment variables, `@nestjs/config` |
| Version control | Git + GitHub, one repo |
| CI | GitHub Actions |
| Design | Figma |
| AI coding | Claude Code |
| Runtime | Node.js (LTS), npm for both apps |

## Validation

- Required checks run in NestJS, using DTOs with class-validator and a global `ValidationPipe`.
- DTO checks: required fields present, email format, password at least 8 characters, valid dates.
- Booking service checks: check-out after check-in, check-in tomorrow or later, no booked nights.
- Front end checks (`required`, `minLength`, disabled calendar dates) are for user experience only.

## Auth

- Email and password in NestJS, following the NestJS authentication recipe.
- Sign up: hash the password with bcrypt and save the staff member.
- Log in: compare with bcrypt, sign a JWT with `@nestjs/jwt`, send it as an httpOnly cookie.
- Staff routes: an `AuthGuard` reads the cookie and verifies the token.
- Log out: clear the cookie.
- Front end: a `401` from the API redirects to the login page.

## Database

- MongoDB Atlas cluster; NestJS connects with `MongooseModule.forRoot(process.env.MONGODB_URI)`.
- A `nights` collection holds one document per booked night, with the date as a unique id.
- A booking and its nights are inserted in one transaction. A duplicate night rolls it back and the API returns `409`.
- Cancelling marks the booking cancelled and deletes its nights in one transaction.
- Dates are stored as `YYYY-MM-DD` strings.

## Testing

- **api:** Jest, `@nestjs/testing` for unit tests, Supertest for end-to-end tests.
- **Database in tests:** mongodb-memory-server in replica set mode (`MongoMemoryReplSet`) so transactions work.
- **web:** Jest with the `next/jest` preset and React Testing Library.

## Linting and formatting

- ESLint in both apps.
- One Prettier config at the repo root.

## Environment variables

`.env` files are not committed. Each app reads its variables from its own `.env` locally and from the Vercel project settings in production.

| App | Variable | Purpose |
|---|---|---|
| api | `MONGODB_URI` | Atlas connection string |
| api | `JWT_SECRET` | Signs login tokens |
| api | `PORT` | Local port only (e.g. `3001`); not used on Vercel |
| web | `API_URL` | Target of the `/api/*` rewrite (e.g. `http://localhost:3001`) |

## CI and deployment

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to any branch. `web/` and `api/` run as two parallel jobs, each skipped until that app has a `package-lock.json`. A new push cancels the running CI for the same branch.

1. Install dependencies (`npm ci`, Node 22, npm cache).
2. Lint.
3. Format check (`prettier --check`).
4. Type check (`tsc --noEmit`).
5. Test.
6. End-to-end test (`api/` only, mongodb-memory-server binary cached).
7. Build.

Vercel deploys both apps from GitHub as two projects: `web/` (root directory `web`) and `api/` (root directory `api`).

## Packages

**Both:** TypeScript, ESLint, Prettier, date-fns, Jest

**web/:** Next.js, Tailwind CSS, react-day-picker, React Testing Library, `@testing-library/user-event`

**api/:** NestJS, class-validator, class-transformer, `@nestjs/config`, `@nestjs/mongoose`, Mongoose, `@nestjs/jwt`, bcrypt, cookie-parser, `@nestjs/testing`, Supertest, mongodb-memory-server
