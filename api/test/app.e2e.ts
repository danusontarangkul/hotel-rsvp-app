import type { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

export type TestApp = {
  app: INestApplication;
  clearDatabase: () => Promise<void>;
};

export async function createTestApp(): Promise<TestApp> {
  const uri = process.env.MONGODB_URI ?? '';
  if (!uri.startsWith('mongodb://127.0.0.1')) {
    throw new Error('e2e tests must run against the in-memory MongoDB');
  }
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  const connection = moduleRef.get<Connection>(getConnectionToken());
  await connection.syncIndexes();

  async function clearDatabase(): Promise<void> {
    const collections = await connection.db?.collections();
    await Promise.all(
      (collections ?? []).map((collection) => collection.deleteMany({})),
    );
  }

  return { app, clearDatabase };
}
