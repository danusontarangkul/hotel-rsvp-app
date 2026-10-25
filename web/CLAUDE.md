# web/CLAUDE.md

Front end conventions.

## Shared components

- Reuse components in `components/shared/` wherever possible. Add a new shared component instead of repeating markup.

## Utils

- Logic likely to be reused goes in a util function in `lib/`, with a test next to it.

## Buttons

- Use `components/shared/Button.tsx` for every button.
- A button that sends a request is disabled and shows a loading label (e.g. "Booking...") while the request runs.
- A form's submit button is disabled until all required fields are filled.
- Every button has a visible focus style.

## Loading

- A page or section that fetches data shows a loading message until the data arrives.
- Nothing shows stale data after a successful change; refetch or update state.

## Errors

- Show errors with `components/shared/ErrorMessage.tsx`.
- API errors show the response's `message`. For a `400`, show each message in the list.
- Field errors show under the field.
- A failed request leaves the form filled in.
- A `401` redirects to `/staff/login`.

## Empty states

- A list with no items shows a message (e.g. "No bookings").

## Forms

- Use `components/shared/TextInput.tsx` for inputs, each with a label.
- Inputs use `required`, `type="email"` and `minLength` where they apply.

## Modals

- Use `components/shared/Modal.tsx` as the base.
- Every modal has a primary action (e.g. Book, Cancel booking) and a secondary action (e.g. Close, Keep booking).
- Close with a close button, Escape or a click outside, except while a request runs.
