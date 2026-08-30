import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
    // Set VITEST=true so redisClient skips connection during tests
    env: {
      VITEST: 'true',
      NODE_ENV: 'test',
    },
    // Allow tests to finish even with open handles (e.g., redis retry timers)
    teardownTimeout: 5000,
    pool: 'forks', // Use forked processes to avoid shared state between test files
  },
});
