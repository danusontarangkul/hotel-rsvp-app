# hotel-rsvp-app

A simple booking web app for a single hotel with one room. Guests browse available dates and book the room. Hotel staff sign up, log in, view all bookings and cancel them.

## Screens

### Guest: book the room

Guests pick a check-in and check-out on the calendar, enter their name, phone and email, and get a booking number.

![Guest booking page: a two-month availability calendar with a stay selected, next to the Your stay panel with the guest details form](docs/images/guest-booking.png)

### Staff: log in

Staff log in with their email and password, or create a staff account.

![Staff log in page with email and password fields, a Log in button and a link to create a staff account](docs/images/staff-login.png)

### Staff: view and cancel bookings

Logged-in staff see every booking, active and cancelled, with the guest's contact details, dates and booking number. They can cancel an active booking after confirming, which opens its dates to guests again.

![Staff bookings page: a table of bookings with guest, contact details, check-in, check-out, booking number, status and a Cancel booking action](docs/images/staff-bookings.png)

## Planning Process

1. Requirements
   - Functional
   - Nonfunctional
2. User Stories
3. Out of scope
4. Tech stack
5. Data model
6. API contract
7. File structure
   - Front end
   - Back end
8. Figma design
9. CI setup
10. Claude rules (CLAUDE.md)
11. Code
12. Testing
    - Automated
    - Manual

## How I Used AI

I built this with Claude and Claude Code as a collaborator, while making the decisions and reviewing the work myself.

**Planning.** I worked through the plan with Claude. While brainstorming, I asked it to list its assumptions and the tradeoffs of each option. I chose the option that fit the project, then had Claude write it up as a document in [`docs/`](docs/), so every later step had a written source of truth.

**Coding.** I used rules in `CLAUDE.md` files ([root](CLAUDE.md), [`web/`](web/CLAUDE.md), [`api/`](api/CLAUDE.md)) to keep Claude Code writing in the style I wanted. Whenever I saw a mistake, I added a new rule so it wouldn't happen again. For example:

- Reusable logic goes in a separate, tested helper function. Any input cleaning, such as trimming or lowercasing an email, is always a util.
- Fixed values and messages live in constants files, and shared types in types files.
- No comments in code, and braces on every `if`.
- My manual edits are kept, never reverted.

**Review.** Claude Code opened a pull request for each piece of work, and I reviewed every one. I read all the code to make sure I understood it, and asked Claude whenever I didn't.

## Design

- [Figma design](https://www.figma.com/design/y8tAJJMZDW2c5K0sspUj0D/Untitled?node-id=4-18643): every screen for guests and staff.

## Docs

- [Requirements](docs/requirements.md): users, functional and nonfunctional requirements, booking rules and User Stories.
- [Out of Scope](docs/out-of-scope.md): improvements left out of this build.
- [Tech Stack](docs/tech-stack.md): languages, frameworks, services and tools.
- [Data Model](docs/data-model.md): database collections and fields.
- [API Contract](docs/api-contract.md): API endpoints with requests and responses.
- [Chat Spec](docs/chat-spec.md): how the chat assistant works, its limits and guardrails.
- [File Structure](docs/file-structure.md): front end and back end folders.
- [Pages](docs/pages.md): routes and page flow.
- [Conventions](docs/conventions.md): coding conventions for both apps.
- [Manual Tests](docs/manual-tests.md): checklist for testing every functional requirement by hand, including error cases.

## Run locally

You need Node.js 22, a MongoDB connection string (MongoDB Atlas free tier works), and Ollama for the chat (`brew install ollama` on a Mac).

**1. Install dependencies** in each app:

```
cd api && npm install
cd web && npm install
```

**2. Create `api/.env`:**

```
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<a long random string, see below>
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
```

To make a `JWT_SECRET`, run this and paste the output after `JWT_SECRET=`:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`OLLAMA_HOST` and `OLLAMA_MODEL` are optional and default to the values above. The web app needs no `.env`; it sends `/api/*` to `http://localhost:3001`.

**3. Start each part in its own terminal.** Closing a terminal (or Ctrl+C) stops that part.

| Terminal | Command | Runs |
|---|---|---|
| 1 | `cd api && npm run ollama` | Ollama, the chat model server, on port 11434 |
| 2 | `cd api && npm run dev` | The API on http://localhost:3001 |
| 3 | `cd web && npm run dev` | The web app on http://localhost:3000 |

**4. First time only, download the chat model** (about 5 GB) while Ollama is running:

```
cd api && npm run ollama:pull
```

Without Ollama the app still works; the chat just says it's unavailable.

## Author

Created by [David Anusontarangkul](https://github.com/danusontarangkul).
