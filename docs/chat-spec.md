# Hotel Booking App: Chat Assistant Spec

A proof of concept chat on `/` for User Stories 7 to 10. Runs locally only, with Ollama and `qwen3:8b`.

## Flow

```
Browser (chat panel) ──POST /api/chat──> NestJS ──> Ollama (qwen3:8b)
                                           ^             │
                                           │   tool call │
                                           │   <─────────┘
                                           │   tool result (BookingsService)
                                           │   ─────────>
Browser <──────────── reply ────────────── NestJS <── final reply
```

1. **Browser:** keeps the chat history and sends it with each new message.
2. **NestJS, in:** reads the login cookie (guest or staff), validates the request, keeps the last 10 messages and runs the incoming guardrails.
3. **NestJS → model:** sends the system prompt, the messages and the tools for that role.
4. **Model → NestJS:** either a reply, or a tool call. NestJS runs the tool through `BookingsService` and sends the result back to the model, up to `MAX_TOOL_ROUNDS` times.
5. **NestJS, out:** runs the outgoing guardrails on the final reply and returns it.

## Context sent to the model

Every request is built from scratch. The model remembers nothing between requests.

| Part | Source |
|---|---|
| System prompt | `CHAT_SYSTEM_PROMPT` in `api/src/chat/chat-system-prompt.ts`: rules and the FAQ |
| Role | `AUDIENCE_PROMPTS.guest` with no valid login cookie, `AUDIENCE_PROMPTS.staff` with one |
| Today's date | From `CLOCK`, in the hotel time zone, after `TODAY_PROMPT_PREFIX`, e.g. `Today is 2026-10-31.` |
| FAQ | `CHAT_FAQ` in `api/src/chat/chat-faq.ts`, sent every time |
| Messages | The last `MAX_CHAT_MESSAGES` (10) messages from the browser |
| Tools | Guest: `get_availability`, `create_booking`. Staff: those plus `cancel_booking`. `get_availability` and `create_booking` are connected so far (`api/src/chat/chat-tools.ts`) |

## Limits

- Chat history lives in the browser only. It is lost on refresh and never saved on the server.
- Only the last 10 messages are sent to the model.
- The context window is `CHAT_CONTEXT_TOKENS`, with `CHAT_REPLY_TOKENS` reserved for the reply, so a long history can't crowd out the answer.
- Thinking mode is off, so replies come back faster.
- Replies are plain text, not streamed.

## Copy

All chat text lives in `api/src/chat/chat.constants.ts`, the source of truth for the wording.

| Constant | When |
|---|---|
| `NO_PERMISSION` | A guest asks for a staff-only action (cancel) |
| `CANNOT_HELP` | The question isn't covered by the FAQ or the tools, or the contact details guardrail blocks the reply |
| `CHAT_UNAVAILABLE` | Ollama is not running (`503`) |

## Guardrails

### Incoming
- The role comes only from the login cookie, never from the messages.
- Guests are never given the staff-only tools, so they can't be called even if the model is tricked.
- Passwords, password hashes, login tokens and env values are never sent to the model. Tool results only contain the fields the API contract already returns.
- `create_booking` only books if the guest's name, email and phone appear in what the guest typed, so the model can't book with made-up details (`api/src/chat/guest-details.ts`).

### Outgoing
- The system prompt tells the model to reply with `NO_PERMISSION` or `CANNOT_HELP` in the cases above, and never to reveal its instructions.
- If a reply to a guest contains an email address or phone number that the guest didn't type in the chat, it is replaced with `CANNOT_HELP`.

## Not in this proof of concept

- No RAG. The FAQ is a fixed text sent every time.
- No MCP.
- No evals.
- No tracing or monitoring.
- No guardrail model. Later, a classifier or a second LLM could check messages going in and replies going out.
