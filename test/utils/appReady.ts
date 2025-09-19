import { INestApplication } from '@nestjs/common';

/**
 * Ensures Nest app is fully ready before issuing HTTP requests in E2E tests.
 * Some specs may hit endpoints before all routes/listeners are bound.
 */
export async function waitForAppReady(app: INestApplication, delayMs = 300): Promise<void> {
  await app.init();
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}
