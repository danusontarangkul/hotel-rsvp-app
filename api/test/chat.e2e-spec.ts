import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './app.e2e';

type ErrorBody = { statusCode: number; message: string | string[] };

const CANNOT_HELP = 'Unfortunately, I cannot help with that.';

const question = { role: 'user', content: 'Is Nov 3 open?' };

describe('POST /api/chat', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  function chat(body: object) {
    return request(app.getHttpServer()).post('/api/chat').send(body);
  }

  function expectBadRequest(body: object, messages: string[]) {
    return chat(body)
      .expect(400)
      .then((response) => {
        expect((response.body as ErrorBody).message).toEqual(messages);
      });
  }

  it('returns 200 with the placeholder reply', async () => {
    const response = await chat({ messages: [question] }).expect(200);

    expect(response.body).toEqual({
      reply: CANNOT_HELP,
      availabilityChanged: false,
    });
  });

  it('accepts a conversation with earlier assistant replies', async () => {
    await chat({
      messages: [
        { role: 'assistant', content: 'How can I help you today?' },
        question,
      ],
    }).expect(200);
  });

  it('treats a bad login cookie as a guest instead of returning 401', async () => {
    await request(app.getHttpServer())
      .post('/api/chat')
      .set('Cookie', 'token=not-a-jwt')
      .send({ messages: [question] })
      .expect(200);
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
});
