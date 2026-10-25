# CLAUDE.md

A simple booking web app for a single hotel with one room. `web/` is the Next.js front end, `api/` is the NestJS back end.

## Docs

Read the relevant doc before changing anything it covers. Update the doc in the same pull request when behavior changes.

- [docs/requirements.md](docs/requirements.md): users, requirements, booking rules, User Stories 1 to 6.
- [docs/out-of-scope.md](docs/out-of-scope.md): what not to build.
- [docs/tech-stack.md](docs/tech-stack.md): frameworks, services, validation, auth, testing, env vars, CI.
- [docs/data-model.md](docs/data-model.md): MongoDB collections and fields.
- [docs/api-contract.md](docs/api-contract.md): endpoints, requests, responses, errors, login cookie.
- [docs/file-structure.md](docs/file-structure.md): folders, files, routes and conventions for both apps.

## Commands

Run inside `web/` or `api/`:

```
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e     # api only
```
