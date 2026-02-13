/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Check if Chromium browser is installed
function checkBrowserInstalled() {
  const possiblePaths = [
    join(homedir(), '.cache', 'ms-playwright'),
    join(process.env.PLAYWRIGHT_BROWSERS_PATH || '', ''),
  ].filter(Boolean);

  const hasChromium = possiblePaths.some(path => {
    const chromiumPath = join(path, 'chromium-1208');
    return existsSync(chromiumPath);
  });

  if (!hasChromium) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ CRITICAL ERROR: Chromium browser is NOT installed!');
    console.error('='.repeat(80));
    console.error('\nYou MUST install the chromium browser before running tests.');
    console.error('All tests must pass before your PR will be merged.\n');
    console.error('To install chromium, run:');
    console.error('  npx playwright install chromium\n');
    console.error('='.repeat(80) + '\n');
    process.exit(1);
  }
}

checkBrowserInstalled();

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  maxFailures: 1, // Stop immediately on first failure for faster feedback
  reporter: [
    ['./tests/playwright/custom-reporter.js'],
    ['html', { open: 'never' }]
  ],
  timeout: 10000, // 10 second test timeout
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 5000, // 5 second timeout for individual actions (was too short at 1s)
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --mode test',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
