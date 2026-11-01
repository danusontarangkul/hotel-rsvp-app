# Hotel Booking App: File Structure

```
hotel-app/
├── web/            Next.js front end
├── api/            NestJS back end
├── docs/           Requirements, API contract, data model, tests
├── .github/
│   └── workflows/
│       └── ci.yml  Lint, type check, test and build on every push
└── .prettierrc
```

## Front end: web/

```
web/
├── app/                    Pages (Next.js App Router)
│   ├── page.tsx            /  calendar, booking form and chat
│   └── staff/
│       ├── signup/         /staff/signup
│       ├── login/          /staff/login
│       └── bookings/       /staff/bookings
├── components/
│   ├── booking/            Calendar, booking form, confirmation modal
│   ├── auth/               Sign up, log in, log out
│   ├── staff/              Bookings table, cancel modal
│   ├── chat/               Chat panel and messages
│   └── shared/             Generic UI: buttons, inputs, modal, table, header
├── hooks/                  One hook per API request (useAvailability, useCreateBooking, useChat, ...)
├── lib/
│   ├── api.ts              All requests to /api/*
│   ├── types.ts            API response shapes
│   └── ...                 Dates, phone, validation and form error helpers
└── next.config.ts          /api/* rewrite to NestJS
```

## Back end: api/

```
api/
├── src/
│   ├── main.ts             Starts the app
│   ├── app.module.ts       Config and MongoDB connection
│   ├── app.setup.ts        /api prefix, cookies, validation
│   ├── auth/               Sign up, log in, log out, login guards
│   ├── staff/              Staff accounts
│   ├── bookings/           Availability, booking, cancel, booking rules
│   ├── chat/               Chat endpoint, Ollama tools, FAQ (chat-faq.ts)
│   └── common/             Dates, clock, email and other helpers
└── test/                   End-to-end tests, one file per area
```
