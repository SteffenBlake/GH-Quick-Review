/**
 * Browser Debug Logger
 * 
 * Three-layer logging system for comprehensive debugging:
 * 1. BROWSER: Logs from the app running in the browser (this file)
 * 2. TEST: Logs from Playwright test code itself
 * 3. SERVER: Logs from the mock server backend
 * 
 * All three layers write to /tmp/unified-debug.log with timestamps.
 * Only active when VITE_DEBUG_LOGGING=1 is set.
 * 
 * Usage:
 *   import './utils/debug-logger.js'; // Import once in main.jsx
 *   
 *   // All console.log/warn/error calls are sent to unified log:
 *   console.log('[MUTATION] Starting...'); 
 * 
 * Unified log format:
 *   [timestamp] [BROWSER] [category] message
 *   [timestamp] [TEST] [category] message  
 *   [timestamp] [SERVER] [category] message
 */

const DEBUG_ENABLED = import.meta.env.VITE_DEBUG_LOGGING === '1';
const API_URL = import.meta.env.VITE_GITHUB_API_URL || 'http://localhost:3000';

/**
 * Send a log message to the backend for unified logging
 */
async function sendLog(category, message, data = null) {
  if (!DEBUG_ENABLED) return;
  
  try {
    await fetch(`${API_URL}/debug-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'BROWSER', category, message, data })
    });
  } catch (err) {
    // Silently fail - don't break the app if logging fails
  }
}

/**
 * Override console methods to capture BROWSER logs for unified file
 * Original console output is PRESERVED for DevTools debugging
 */
if (DEBUG_ENABLED) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.log = function(...args) {
    // Call original to show in DevTools
    originalLog.apply(console, args);
    
    // Send to unified log file as BROWSER
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Parse [CATEGORY] prefix if present
    const match = text.match(/^\[([^\]]+)\]\s*(.+)/);
    if (match) {
      sendLog(match[1], match[2]);
    } else {
      sendLog('console', text);
    }
  };
  
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    sendLog('console.warn', text);
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    sendLog('console.error', text);
  };
}

export { sendLog, DEBUG_ENABLED };
