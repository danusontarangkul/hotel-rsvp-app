# web/CLAUDE.md

Front end conventions.

## Design

- The Figma file is the source of truth for layout, spacing, colors, typography and copy: https://www.figma.com/design/y8tAJJMZDW2c5K0sspUj0D/Untitled
- Before building or changing a page or component, open its frame below with the Figma MCP (`get_design_context` / `get_screenshot`, fileKey `y8tAJJMZDW2c5K0sspUj0D`) and match it.
- Use the copy exactly as it is in Figma. Don't add text, images or decoration that aren't there.
- Figma is a reference, not code to paste: build it with the shared components and Tailwind, and follow the rules in this file.
- If Figma and `docs/` disagree, `docs/` wins. Flag the difference instead of guessing.

| Screen                          | Route             | Figma node |
| ------------------------------- | ----------------- | ---------- |
| Guest availability              | `/`               | `4:17002`  |
| Guest booking form              | `/`               | `4:17283`  |
| Guest booking validation errors | `/`               | `4:17572`  |
| Guest booking confirmation      | `/`               | `4:17865`  |
| Guest dates no longer available | `/`               | `4:18158`  |
| Staff sign up                   | `/staff/signup`   | `4:18434`  |
| Staff sign up errors            | `/staff/signup`   | `4:18480`  |
| Staff log in                    | `/staff/login`    | `4:18532`  |
| Staff log in error              | `/staff/login`    | `4:18578`  |
| Staff bookings                  | `/staff/bookings` | `4:18624`  |
| Staff bookings empty            | `/staff/bookings` | `4:18791`  |
| Staff cancel confirmation       | `/staff/bookings` | `4:18864`  |

Link to a frame: `https://www.figma.com/design/y8tAJJMZDW2c5K0sspUj0D/Untitled?node-id=<node with - instead of :>`.

## Colors

- The style guide is the `@theme` block in `app/globals.css`. Every color is a `--color-*` token there, named by role (e.g. `--color-surface`, `--color-border`, `--color-error`), with values taken from Figma.
- Reuse a token through its Tailwind class (`bg-surface`, `border-border`, `text-error`). No hex, rgb or arbitrary values in components (`bg-[#f5f3ee]`), and no inline `style` colors.
- If a color you need doesn't exist, add it to `@theme` with a role name and its Figma value, then use the class. Don't add a second token with the same value.

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

## Layout shifts

- No layout shifts. Showing or hiding content must not move what's around it.
- Every field reserves space for one line of error text under it, so a field error appears without pushing the form down.
- Form-level error messages have a reserved slot that is always in the layout, empty when there's no error.
- Loading labels and messages take the same space as what replaces them (e.g. a button keeps its width while showing "Booking...").

## Empty states

- A list with no items shows a message (e.g. "No bookings").

## Forms

- Use `components/shared/TextInput.tsx` for inputs, each with a label.
- Inputs use `required`, `type="email"` and `minLength` where they apply.

## Tests

- Jest + React Testing Library. Test files sit next to the file they test (`BookingForm.test.tsx` beside `BookingForm.tsx`).
- Every component in `components/` and every util in `lib/` has a test.
- Test what the user sees and does, not implementation details. No testing internal state or class names.
- Find elements by role, label or text (`getByRole`, `getByLabelText`, `getByText`), not by test ids or CSS selectors.
- Simulate user actions with `@testing-library/user-event`, not by calling handlers directly.
- Mock the network at `lib/api.ts`, never call the real API. No real timers or dates: fix "today" with `jest.useFakeTimers().setSystemTime(...)`.
- Each component test covers: the happy path, each error it can show (field errors, API `message`, 400 list), the loading state (button disabled, loading label), and the empty state where it applies.
- Booking rules get util tests in `lib/dates.test.ts`: today and past dates blocked, booked nights blocked, same-day turnover allowed, check-out after check-in, a stay can't include a booked night.
- One behaviour per test, named as a sentence: `it('shows an error when the email is missing')`.
- Tests don't depend on each other or on run order. Reset mocks in `afterEach`.
- `npm test` passes before a pull request, and a bug fix comes with a test that fails without it.

## Modals

- Use `components/shared/Modal.tsx` as the base.
- Every modal has a primary action (e.g. Book, Cancel booking) and a secondary action (e.g. Close, Keep booking).
- Close with a close button, Escape or a click outside, except while a request runs.
