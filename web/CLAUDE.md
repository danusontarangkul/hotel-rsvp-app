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

## Typography

- Headings use `font-heading` (Lora); everything else uses the default `font-sans` (Inter). Both are loaded with `next/font` in `app/layout.tsx` and mapped in `@theme` in `app/globals.css`.

## Shared components

- Reuse components in `components/shared/` wherever possible. Add a new shared component instead of repeating markup.
- Every page is wrapped in `Page` (`width="narrow"` for single forms, `"wide"` for everything else) and has one `PageHeading`. No raw `<main>` or `<h1>` in pages.
- Every form uses `Form`, so fields and actions have the same spacing. No raw `<form>`.
- `Form` lays out every form the same way: fields (`children`), then the buttons (`actions`), then the form-level errors (`errors`) at the bottom. Pass form-level errors to `Form`; don't render `ErrorMessage` for them yourself.
- Shared components own their styling and don't accept `className`, so every use looks the same. If a new look is needed, add a variant prop (like `Page`'s `width`), not a class override.

## TypeScript

- Give every hook an explicit type argument, even when it could be inferred: `useState<boolean>(false)`, `useState<string>('')`, `useRef<HTMLInputElement | null>(null)`.
- Don't use deprecated React types. For form submit use `SubmitEvent<HTMLFormElement>` / `SubmitEventHandler`, not `FormEvent`; for inputs use `ChangeEvent`.

## Hooks

- Every API call goes through a hook in `hooks/`, one per call, named after it (`useSignup`, `useLogin`, `useCreateBooking`, `useCancelBooking`). Components never call `lib/api.ts` directly.
- Hooks for requests that change data (POST) wrap `useApiMutation`, which owns `loading`, `error` (an `ApiError` or `null`), `data` and `reset()` (clears all three, e.g. when a result modal closes). Don't write loading or error state for a request by hand.
- Hooks for requests that read data (GET) wrap `useApiQuery`, which loads on mount and owns `loading`, `error`, `data` and `refetch`.
- `run(input)` resolves with the response, or `null` on failure; it never throws. Check the result before navigating.
- Hooks hold request state only. Mapping errors to fields, navigation and copy stay in the component.

## Utils

- Logic likely to be reused goes in a util function in `lib/`, with a test next to it.

## Buttons

- Use `components/shared/Button.tsx` for every button. The only exception is the calendar's day cells and month arrows, which `react-day-picker` renders (`AvailabilityCalendar` styles them).
- A button that sends a request passes `loading` while the request runs. A loading button shows only the shared `Spinner`, with no loading text (no "Booking...", "Signing up..."), and is always disabled, whatever `disabled` says. Don't build your own loading button or spinner.
- Any other loading indicator (e.g. a page's loading message) uses `components/shared/Spinner.tsx` too.
- A form's submit button is disabled until all required fields are filled and valid: text fields pass `isFilled`, emails pass `isValidEmail` and passwords pass `isValidPassword` (at least `MIN_PASSWORD_LENGTH` characters), both from `lib/validation.ts`.
- Every button has a visible focus style.
- Enabled buttons show the pointer cursor and disabled ones show `not-allowed` (`cursor-pointer disabled:cursor-not-allowed`). Tailwind v4 doesn't do this by default, so `Button` sets it; anything else clickable that isn't `Button` (e.g. the calendar's day cells and month arrows) sets it too.

## Loading

- A page or section that fetches data shows a loading message with `components/shared/LoadingMessage.tsx` until the data arrives. If the request fails, show the error with a "Try again" button that calls `refetch`.
- Nothing shows stale data after a successful change; call the query hook's `refetch` or update state.

## Errors

- Show errors with `components/shared/ErrorMessage.tsx`.
- API errors show the response's `message`. For a `400`, show each message in the list.
- Field errors show under the field.
- Forms turn a hook's `error` into field and form errors with `toFormErrors(error, FIELDS, { status: field })` from `lib/form-errors.ts`. Don't write per-form error mapping.
- A failed request leaves the form filled in.
- A `401` redirects to `/staff/login`.

## Responsive layout

- Build mobile first: unprefixed Tailwind classes are the phone layout, and `sm:` and up add the wider layout. No `max-*:` variants.
- On small screens, everything stacks vertically: anything side by side on desktop (fields, buttons, calendar and form, table columns) is `flex-col` by default and becomes a row only at `sm:` or wider (e.g. `flex flex-col gap-2 sm:flex-row`).
- Tables become stacked cards on small screens, one booking per card with each value under its label.
- Modals and buttons in a stacked layout are full width on small screens.
- Use Tailwind's breakpoints only. No `@media` rules in CSS files, no custom breakpoint values, no JavaScript screen-size checks.
- Nothing scrolls sideways at 320px wide.

## Layout shifts

- No layout shifts. Showing or hiding content must not move what's around it.
- Every field reserves space for one line of error text under it, so a field error appears without pushing the form down.
- Form-level error messages have a reserved slot under the form's buttons (rendered by `Form`) that is always in the layout, empty when there's no error.
- Loading states take the same space as what replaces them (e.g. a button keeps its size while showing the spinner).

## Empty states

- A list with no items shows a message (e.g. "No bookings").

## Forms

- Use `components/shared/TextInput.tsx` for inputs, each with a label.
- Inputs use `required`, `type="email"` and `minLength` where they apply. `TextInput` marks required fields with ` *` after the label.
- `Form` sets `noValidate`: the browser's own validation bubbles never show. Field errors use the Figma copy under the field, shown once the user leaves the field (e.g. "Password must be at least 8 characters.").
- Password fields use `PasswordInput`, which has the show/hide button.
- Email fields use `EmailInput` (label "Email address", `type="email"`, `autoComplete="email"`).
- Phone fields use `PhoneInput`. It shows `(123) 456-7890` as the user types but its `value` and `onChange` are digits only; send and store digits, and format with `formatPhone` from `lib/phone.ts` wherever a number is shown.

## Tests

- Jest + React Testing Library. Test files sit next to the file they test (`BookingForm.test.tsx` beside `BookingForm.tsx`).
- Every component in `components/`, every hook in `hooks/` and every util in `lib/` has a test. Test hooks with `renderHook`.
- Test what the user sees and does, not implementation details. No testing internal state or class names.
- Find elements by role, label or text (`getByRole`, `getByLabelText`, `getByText`), not by test ids or CSS selectors.
- Simulate user actions with `@testing-library/user-event`, not by calling handlers directly.
- Mock the network at `lib/api.ts`, never call the real API. No real timers or dates: fix "today" with `jest.useFakeTimers().setSystemTime(...)`.
- Each component test covers: the happy path, each error it can show (field errors, API `message`, 400 list), the loading state (button disabled and busy), and the empty state where it applies.
- Booking rules get util tests in `lib/dates.test.ts`: today and past dates blocked, booked nights blocked, same-day turnover allowed, check-out after check-in, a stay can't include a booked night.
- One behaviour per test, named as a sentence: `it('shows an error when the email is missing')`.
- Tests don't depend on each other or on run order. Reset mocks in `afterEach`.
- `npm test` passes before a pull request, and a bug fix comes with a test that fails without it.

## Modals

- Use `components/shared/Modal.tsx` as the base. It renders the title, a close (×) button and the `actions` row (the same `Actions` row as `Form`).
- Every modal has a primary action (e.g. Book, Cancel booking) and a secondary action (e.g. Close, Keep booking).
- Close with a close button, Escape or a click outside, except while a request runs.
