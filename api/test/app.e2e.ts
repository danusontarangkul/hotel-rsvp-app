import type { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { CLOCK, type Clock } from '../src/common/clock';

export type TestApp = {
  app: INestApplication;
  clearDatabase: () => Promise<void>;
};

export type TestAppOptions = {
  now?: Date;
};

export async function createTestApp(
  options: TestAppOptions = {},
): Promise<TestApp> {
  const uri = process.env.MONGODB_URI ?? '';
  if (!uri.startsWith('mongodb://127.0.0.1')) {
    throw new Error('e2e tests must run against the in-memory MongoDB');
  }
  const builder = Test.createTestingModule({ imports: [AppModule] });
  const { now } = options;
  if (now) {
    const fixedClock: Clock = { now: () => now };
    builder.overrideProvider(CLOCK).useValue(fixedClock);
  }
  const moduleRef = await builder.compile();
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
