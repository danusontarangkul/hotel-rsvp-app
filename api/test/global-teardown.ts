export default async function globalTeardown(): Promise<void> {
  await globalThis.testMongo?.stop();
}
