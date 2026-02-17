/**
 * Test Debug Logger
 * 
 * Provides file-based logging for debugging Playwright tests.
 * Enable by setting MOCK_SERVER_DEBUG=1 environment variable.
 * 
 * Usage:
 *   import { debugLog, clearDebugLog } from './test-debug-logger.js';
 *   
 *   debugLog('submitReview', 'Review submitted', { reviewId: 5001 });
 *   clearDebugLog(); // Clear log file at start of test
 * 
 * Log file location: /tmp/mock-server-debug.log
 */

import { appendFileSync, writeFileSync, existsSync } from 'fs';

const DEBUG_LOG_PATH = '/tmp/mock-server-debug.log';
const DEBUG_ENABLED = process.env.MOCK_SERVER_DEBUG === '1';

/**
 * Log a debug message to file if debugging is enabled
 * @param {string} category - Category/source of the log (e.g., 'submitReview', 'listReviews')
 * @param {string} message - The message to log
 * @param {object} [data] - Optional data object to include
 */
export function debugLog(category, message, data = null) {
  if (!DEBUG_ENABLED) return;
  
  const timestamp = new Date().toISOString();
  let logLine = `[${timestamp}] [${category}] ${message}`;
  
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
  if (!DEBUG_ENABLED) return;
  
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
