import { buildSystemPrompt } from './build-system-prompt';
import { AUDIENCE_PROMPTS, CHAT_SYSTEM_PROMPT } from './chat-system-prompt';

describe('buildSystemPrompt', () => {
  it('starts with the rules and the FAQ', () => {
    expect(
      buildSystemPrompt('guest', '2026-11-01').startsWith(CHAT_SYSTEM_PROMPT),
    ).toBe(true);
  });

  it('tells the model the user is a guest', () => {
    const prompt = buildSystemPrompt('guest', '2026-11-01');

    expect(prompt).toContain(AUDIENCE_PROMPTS.guest);
    expect(prompt).not.toContain(AUDIENCE_PROMPTS.staff);
  });

  it('tells the model the user is staff', () => {
    const prompt = buildSystemPrompt('staff', '2026-11-01');

    expect(prompt).toContain(AUDIENCE_PROMPTS.staff);
    expect(prompt).not.toContain(AUDIENCE_PROMPTS.guest);
  });

  it("ends with today's date", () => {
    expect(buildSystemPrompt('guest', '2026-11-01')).toMatch(
      /Today is 2026-11-01\.$/,
    );
  });
});
