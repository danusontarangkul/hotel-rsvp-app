import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';

let replSet: MongoMemoryReplSet;
let app: INestApplication;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replSet.getUri();
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
});

afterAll(async () => {
  await app.close();
  await replSet.stop();
});

it('boots and runs a transaction', async () => {
  const conn = app.get<Connection>(getConnectionToken());
  const session = await conn.startSession();
  await session.withTransaction(async () => {
    await conn.collection('x').insertOne({ a: 1 }, { session });
  });
  await session.endSession();
  await request(app.getHttpServer() as never)
    .get('/api/nope')
    .expect(404);
});
