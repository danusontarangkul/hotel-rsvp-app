# api/CLAUDE.md

Back end conventions.

## Utils

- Logic likely to be reused goes in a util function in `src/common/`, with a spec next to it.

## Controllers and services

- Controllers only take the DTO and call the service. No logic or database calls in controllers.
- Booking rules and database access live in services.
- Throw NestJS built-in exceptions (`BadRequestException`, `ConflictException`, `NotFoundException`, `UnauthorizedException`). Never build error responses by hand.
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
- Emails are lowercased before saving and before lookup.
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
- Tests freeze "today" so date rules don't depend on the run date.

## General

- No `console.log`. Use the NestJS `Logger` if logging is needed.
- No new endpoint, field or status code without updating `docs/api-contract.md`.
