/**
 * Test Debug Logger Helper
 *
 * Allows Playwright tests to log to the unified debug log file.
 *
 * Usage:
 *   import { testLog } from '../utils/test-logger.js';
 *
 *   test('my test', async ({ page }) => {
 *     await testLog('test-name', 'Starting test...');
 *     // ... test code ...
 *     await testLog('test-name', 'Test completed');
 *   });
 *
 * Logs appear in /tmp/unified-debug.log as:
 *   [timestamp] [TEST] [category] message
 */

const MOCK_SERVER_URL = process.env.VITE_GITHUB_API_URL || 'http://localhost:3000';

/**
 * Send a log message from test code to unified log
 * @param {string} category - Category/test name
 * @param {string} message - Message to log
 * @param {object} [data] - Optional data object
 */
export async function testLog(category, message, data = null) {
  try {
    await fetch(`${MOCK_SERVER_URL}/debug-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'TEST',
        category,
        message,
        data
      })
    });
  } catch (err) {
    // Silently fail - don't break tests if logging fails
    console.error('Failed to send test log:', err.message);
  }
}
