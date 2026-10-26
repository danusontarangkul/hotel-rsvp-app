import { MongoMemoryReplSet } from 'mongodb-memory-server';

declare global {
  var testMongo: MongoMemoryReplSet | undefined;
}

export default async function globalSetup(): Promise<void> {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  globalThis.testMongo = replSet;
  process.env.MONGODB_URI = replSet.getUri('hotel-test');
  process.env.JWT_SECRET = 'test-jwt-secret';
}
