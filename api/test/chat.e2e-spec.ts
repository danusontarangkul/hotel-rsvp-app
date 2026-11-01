import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type {
  ChatModel,
  ModelMessage,
  ModelReply,
  ModelTool,
} from '../src/chat/chat.types';
import { createTestApp } from './app.e2e';

type ErrorBody = { statusCode: number; message: string | string[] };

const NOON_IN_LOS_ANGELES_ON_NOVEMBER_1 = new Date('2026-11-01T19:00:00.000Z');

const MODEL_REPLY = 'Check-in starts tomorrow at the earliest.';

const question = { role: 'user', content: 'When is the earliest check-in?' };

const modelReply = jest.fn<
  Promise<ModelReply>,
  [ModelMessage[], ModelTool[]]
>();
const chatModel: ChatModel = { reply: modelReply };

function text(content: string): ModelReply {
  return { content, toolCalls: [] };
}

function ollamaNotRunning(): Error {
  return new TypeError('fetch failed');
}

describe('POST /api/chat', () => {
  let app: INestApplication<App>;
  let clearDatabase: () => Promise<void>;

  beforeAll(async () => {
    ({ app, clearDatabase } = await createTestApp({
      now: NOON_IN_LOS_ANGELES_ON_NOVEMBER_1,
      chatModel,
    }));
  });

  beforeEach(() => {
    modelReply.mockResolvedValue(text(MODEL_REPLY));
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  function chat(body: object) {
    return request(app.getHttpServer()).post('/api/chat').send(body);
  }

  async function staffCookie(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ name: 'Sam Lee', email: 'sam@hotel.com', password: 'at-least-8' })
      .expect(201);
    const [cookie] = response.get('Set-Cookie') ?? [];
    return cookie.split(';')[0];
  }

  function sentSystemPrompt(): string {
    return modelReply.mock.calls[0][0][0].content;
  }

  function book(checkIn: string, checkOut: string) {
    return request(app.getHttpServer())
      .post('/api/bookings')
      .send({
        guestName: 'Maya Chen',
        guestEmail: 'maya.chen@example.com',
        guestPhone: '4155550349',
        checkIn,
        checkOut,
      })
      .expect(201);
  }

  async function availabilityResultFor(
    args: Record<string, unknown>,
  ): Promise<unknown> {
    modelReply
      .mockResolvedValueOnce({
        content: '',
        toolCalls: [{ name: 'get_availability', arguments: args }],
      })
      .mockResolvedValueOnce(text('Here is what I found.'));
    await chat({ messages: [question] }).expect(200);
    const toolMessage = modelReply.mock.calls[1][0].at(-1);
    return JSON.parse(toolMessage?.content ?? 'null');
  }

  it('gives the model the get_availability tool', async () => {
    await chat({ messages: [question] }).expect(200);

    const toolNames = modelReply.mock.calls[0][1].map((tool) => tool.name);
    expect(toolNames).toEqual(['get_availability']);
  });

  it('answers get_availability with the booked nights from the database', async () => {
    await book('2026-11-05', '2026-11-07');

    await expect(availabilityResultFor({})).resolves.toEqual({
      firstBookableDate: '2026-11-02',
      bookedNights: ['2026-11-05', '2026-11-06'],
    });
  });

  it('answers get_availability for a stay that overlaps a booking', async () => {
    await book('2026-11-05', '2026-11-07');

    await expect(
      availabilityResultFor({ checkIn: '2026-11-04', checkOut: '2026-11-06' }),
    ).resolves.toEqual({
      firstBookableDate: '2026-11-02',
      bookedNights: ['2026-11-05', '2026-11-06'],
      stay: {
        checkIn: 'Wednesday, November 4, 2026',
        checkOut: 'Friday, November 6, 2026',
        available: false,
        reason: 'Some nights in this stay are already booked.',
        bookedNightsInStay: ['2026-11-05'],
      },
    });
  });

  it('answers get_availability for a free stay', async () => {
    await book('2026-11-05', '2026-11-07');

    await expect(
      availabilityResultFor({ checkIn: '2026-11-03', checkOut: '2026-11-05' }),
    ).resolves.toEqual({
      firstBookableDate: '2026-11-02',
      bookedNights: ['2026-11-05', '2026-11-06'],
      stay: {
        checkIn: 'Tuesday, November 3, 2026',
        checkOut: 'Thursday, November 5, 2026',
        available: true,
      },
    });
  });

  it('answers get_availability for one night when only check-in is given', async () => {
    await book('2026-11-05', '2026-11-07');

    await expect(
      availabilityResultFor({ checkIn: '2026-11-05' }),
    ).resolves.toEqual({
      firstBookableDate: '2026-11-02',
      bookedNights: ['2026-11-05', '2026-11-06'],
      stay: {
        checkIn: 'Thursday, November 5, 2026',
        checkOut: 'Friday, November 6, 2026',
        available: false,
        reason: 'Some nights in this stay are already booked.',
        bookedNightsInStay: ['2026-11-05'],
      },
    });
  });

  it("returns the model's reply after it uses a tool", async () => {
    modelReply
      .mockResolvedValueOnce({
        content: '',
        toolCalls: [{ name: 'get_availability', arguments: {} }],
      })
      .mockResolvedValueOnce(text('Nov 3 is open.'));

    const response = await chat({ messages: [question] }).expect(200);

    expect(response.body).toEqual({
      reply: 'Nov 3 is open.',
      availabilityChanged: false,
    });
  });

  function expectBadRequest(body: object, messages: string[]) {
    return chat(body)
      .expect(400)
      .then((response) => {
        expect((response.body as ErrorBody).message).toEqual(messages);
      });
  }

  it("returns 200 with the model's reply", async () => {
    const response = await chat({ messages: [question] }).expect(200);

    expect(response.body).toEqual({
      reply: MODEL_REPLY,
      availabilityChanged: false,
    });
  });

  it("tells the model today's date in the hotel's time zone", async () => {
    await chat({ messages: [question] }).expect(200);

    expect(sentSystemPrompt()).toContain('Today is 2026-11-01.');
  });

  it('treats a request without a login cookie as a guest', async () => {
    await chat({ messages: [question] }).expect(200);

    expect(sentSystemPrompt()).toContain('The user is a guest.');
  });

  it('treats a bad login cookie as a guest instead of returning 401', async () => {
    await request(app.getHttpServer())
      .post('/api/chat')
      .set('Cookie', 'token=not-a-jwt')
      .send({ messages: [question] })
      .expect(200);

    expect(sentSystemPrompt()).toContain('The user is a guest.');
  });

  it('treats a logged-in staff member as staff', async () => {
    const cookie = await staffCookie();

    await request(app.getHttpServer())
      .post('/api/chat')
      .set('Cookie', cookie)
      .send({ messages: [question] })
      .expect(200);

    expect(sentSystemPrompt()).toContain('The user is logged-in hotel staff.');
  });

  it('sends only the last 10 messages to the model', async () => {
    const messages = Array.from({ length: 13 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${index + 1}`,
    }));

    await chat({ messages }).expect(200);

    const sent = modelReply.mock.calls[0][0];
    expect(sent).toHaveLength(11);
    expect(sent[1].content).toBe('Message 4');
  });

  it('returns 503 when Ollama is not running', async () => {
    modelReply.mockRejectedValue(ollamaNotRunning());

    const response = await chat({ messages: [question] }).expect(503);

    expect((response.body as ErrorBody).message).toBe('Chat is unavailable.');
  });

  it('returns 400 when messages are missing', async () => {
    await expectBadRequest({}, ['Messages are required.']);
  });

  it('returns 400 when messages are empty', async () => {
    await expectBadRequest({ messages: [] }, ['Messages are required.']);
  });

  it('returns 400 for a bad role', async () => {
    await expectBadRequest({ messages: [{ role: 'system', content: 'Hi' }] }, [
      'Role must be user or assistant.',
    ]);
  });

  it('returns 400 for blank content', async () => {
    await expectBadRequest({ messages: [{ role: 'user', content: '   ' }] }, [
      'Message content is required.',
    ]);
  });

  it('returns 400 for a user message over 200 characters', async () => {
    await expectBadRequest(
      { messages: [{ role: 'user', content: 'a'.repeat(201) }] },
      ['Message content must be at most 200 characters.'],
    );
  });

  it('returns 400 when the last message is not from the user', async () => {
    await expectBadRequest(
      { messages: [question, { role: 'assistant', content: 'Hello' }] },
      ['The last message must be from the user.'],
    );
  });

  it('returns 400 for an unknown field', async () => {
    await chat({ messages: [question], extra: true }).expect(400);
  });

  it('does not call the model for a bad request', async () => {
    await chat({ messages: [] }).expect(400);

    expect(modelReply).not.toHaveBeenCalled();
  });
});
