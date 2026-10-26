# api/CLAUDE.md

Back end conventions.

## Utils

- Logic likely to be reused goes in a util function in `src/common/`, with a spec next to it.
- Input cleaning is always a util (see the root `CLAUDE.md`), e.g. `normalizeEmail` in `src/common/email.ts`, `trimString` in `src/common/transforms.ts`.

## Constants

- Fixed values and user-facing messages live in a constants file, never inline: `<module>.constants.ts` in the module that owns them (e.g. `auth/auth.constants.ts`), or `src/common/constants.ts` when several modules use them.
- Name them in `UPPER_SNAKE_CASE` by what they mean (`BCRYPT_COST`, `EMAIL_TAKEN`, `TOKEN_COOKIE`), and build related values from each other (`PASSWORD_TOO_SHORT` uses `MIN_PASSWORD_LENGTH`).
- Tests import the same constants instead of repeating the values, except e2e tests, which check the exact text and numbers in the API contract.

## Types

- Types a module shares with other files go in `<module>.types.ts` in that module (e.g. `staff/staff.types.ts`, `auth/auth.types.ts`). Types used by only one file can stay in that file.
- Schema files hold only the Mongoose schema; record types built from it (`StaffRecord`) go in the types file.
- Response types match the shapes in `docs/api-contract.md` exactly.
- Use `import type` for type-only imports.

## Controllers and services

- Controllers only take the DTO and call the service. No logic or database calls in controllers.
- Booking rules and database access live in services.
- Throw NestJS built-in exceptions (`BadRequestException`, `ConflictException`, `NotFoundException`, `UnauthorizedException`). Never build error responses by hand.
- Only `try`/`catch` an error you expect and can translate into a status from `docs/api-contract.md` (e.g. a duplicate-key `11000` on insert becomes `409`). Re-throw anything else unchanged. Everything you don't expect (database down, missing config, bugs) is left to NestJS, which returns `500` and logs it; don't wrap calls just to re-throw, log, or replace the error with a friendlier one.
- "Not found" and "doesn't match" are values, not errors: check `null` / `false` with an `if` and throw the contract exception.
- Use `@HttpCode` where the default is wrong: `200` for login and cancel, `204` for logout.

## Validation and DTOs

- Every request body has a DTO in `dto/` with class-validator decorators.
- `ValidationPipe` uses `whitelist` and `forbidNonWhitelisted`; unknown fields are rejected.
- "Not blank" fields are trimmed and use `@IsNotEmpty`. Dates are checked as `YYYY-MM-DD`.
- Checks that need today's date or the database go in the service, not the DTO.

## Responses

- Never return raw Mongoose documents. Map them to the contract shape (`id`, not `_id`).
- Never return `passwordHash` or the JWT in a body.
- Error messages are short sentences a guest can read; the front end shows them as-is.

## Database

- Writes that touch both bookings and nights use one session and one transaction.
- A duplicate-key error (`11000`) on nights becomes a `409`.
- Reads use `.lean()`.
- Emails go through `normalizeEmail` (`src/common/email.ts`: trim and lowercase) before saving and before lookup.
- Dates stay `YYYY-MM-DD` strings. All date math goes through `src/common/dates.ts`.

## Auth

- Hash passwords with bcrypt, cost 10.
- Login returns the same `401` message for an unknown email and a wrong password.
- Set and clear the cookie only in `auth.controller.ts`, with the settings in the API contract.
- Read config with `ConfigService`. No `process.env` outside `main.ts`.

## Testing

- Every service method has a unit test.
- Every endpoint has an e2e test for success and each error status in the API contract.
- E2e tests use `MongoMemoryReplSet` and clear the collections between tests.
- Tests freeze "today" so date rules don't depend on the run date: services read the time from the injected `CLOCK` (`src/common/clock.ts`), and tests replace it with a fixed `now` (`createTestApp({ now })` in e2e tests).

## General

- No `console.log`. Use the NestJS `Logger` if logging is needed.
- No new endpoint, field or status code without updating `docs/api-contract.md`.
