/**
 * Test Debug Logger
 *
 * Provides unified file-based logging for debugging Playwright tests.
 * Combines frontend (browser) and backend (mock server) logs with timestamps.
 *
 * Enable by setting DEBUG_LOGGING=1 environment variable.
 *
 * Usage:
 *   // Backend (Node.js)
 *   import { debugLog, clearDebugLog } from './test-debug-logger.js';
 *   debugLog('submitReview', 'Review submitted', { reviewId: 5001 });
 *
 *   // Frontend (Browser)
 *   // Console logs are automatically captured when DEBUG_LOGGING=1
 *
 * Log file location: /tmp/unified-debug.log
 */

import { appendFileSync, writeFileSync, existsSync } from 'fs';

const DEBUG_LOG_PATH = '/tmp/unified-debug.log';
const DEBUG_ENABLED = process.env.DEBUG_LOGGING === '1';

/**
 * Log a debug message to file if debugging is enabled
 * @param {string} source - Source of the log ('BACKEND' or 'FRONTEND')
 * @param {string} category - Category/source of the log (e.g., 'submitReview', 'mutation')
 * @param {string} message - The message to log
 * @param {object} [data] - Optional data object to include
 */
export function debugLog(source, category, message, data = null) {
  if (!DEBUG_ENABLED) {return;}

  const timestamp = new Date().toISOString();
  let logLine = `[${timestamp}] [${source}] [${category}] ${message}`;

  if (data) {
    logLine += ` ${JSON.stringify(data)}`;
  }

  logLine += '\n';

  try {
    appendFileSync(DEBUG_LOG_PATH, logLine);
  } catch (err) {
    // Silently fail if we can't write to log file
    console.error('Failed to write debug log:', err.message);
  }
}

/**
 * Clear the debug log file
 * Call this at the start of a test to ensure clean state
 */
export function clearDebugLog() {
  if (!DEBUG_ENABLED) {return;}

  try {
    writeFileSync(DEBUG_LOG_PATH, '');
  } catch (err) {
    console.error('Failed to clear debug log:', err.message);
  }
}

/**
 * Check if debug logging is enabled
 * @returns {boolean}
 */
export function isDebugEnabled() {
  return DEBUG_ENABLED;
}

/**
 * Get the debug log file path
 * @returns {string}
 */
export function getDebugLogPath() {
  return DEBUG_LOG_PATH;
}
