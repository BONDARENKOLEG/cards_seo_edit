import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setupEnv.ts'],
    // SQLite (via better-sqlite3) doesn't handle concurrent connections from
    // multiple worker processes well — keep the DB-touching tests sequential.
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
