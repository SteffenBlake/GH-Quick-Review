/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Test helper utilities for Playwright tests
 */

/**
 * Check if mock server is running (started by webServer config)
 * @param {number} port - Port to check (default 3000)
 * @returns {Promise<boolean>} - True if server is running
 */
export async function isMockServerRunning(port = 3000) {
  try {
    const response = await fetch(`http://localhost:${port}/heartbeat`);
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
  } catch (e) {
    // Server not running
  }
  return false;
}

/**
 * Wait for mock server to be ready
 * @param {number} port - Port to check (default 3000)
 * @param {number} maxAttempts - Maximum number of attempts (default 20)
 * @param {number} delayMs - Delay between attempts in ms (default 500)
 * @returns {Promise<void>}
 */
export async function waitForMockServer(port = 3000, maxAttempts = 20, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isMockServerRunning(port)) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error(`Mock server on port ${port} did not start within ${maxAttempts * delayMs}ms`);
}
