import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 390, height: 844 },  // iPhone 14 size
    actionTimeout: 5_000,
    locale: 'cs-CZ',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
