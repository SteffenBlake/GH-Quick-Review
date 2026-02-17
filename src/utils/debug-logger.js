/**
 * Frontend Debug Logger
 * 
 * Three-layer logging system for comprehensive debugging:
 * 1. BROWSER: Logs still appear in browser DevTools console (for manual debugging)
 * 2. FRONTEND: Logs sent to unified file via backend endpoint (for test analysis)
 * 3. BACKEND: Mock server logs written directly to unified file
 * 
 * Only active when VITE_DEBUG_LOGGING=1 is set.
 * 
 * Usage:
 *   import './utils/debug-logger.js'; // Import once in main.jsx
 *   
 *   // All console.log/warn/error calls are:
 *   // - Displayed in browser console (layer 1: BROWSER)
 *   // - Sent to unified log file (layer 2: FRONTEND in /tmp/unified-debug.log)
 *   console.log('[MUTATION] Starting...'); 
 * 
 * Unified log format:
 *   [timestamp] [BACKEND] [category] message
 *   [timestamp] [FRONTEND] [category] message
 */

const DEBUG_ENABLED = import.meta.env.VITE_DEBUG_LOGGING === '1';
const API_URL = import.meta.env.VITE_GITHUB_API_URL || 'http://localhost:3000';

/**
 * Send a log message to the backend for unified logging
 * This does NOT replace browser console - it adds to it
 */
async function sendLog(category, message, data = null) {
  if (!DEBUG_ENABLED) return;
  
  try {
    await fetch(`${API_URL}/debug-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, message, data })
    });
  } catch (err) {
    // Silently fail - don't break the app if logging fails
  }
}

/**
 * Override console methods to capture logs for unified file
 * Original console output is PRESERVED - logs still appear in browser DevTools
 */
if (DEBUG_ENABLED) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.log = function(...args) {
    // LAYER 1: Call original to show in BROWSER console (for manual debugging)
    originalLog.apply(console, args);
    
    // LAYER 2: Send to unified log file as FRONTEND (for test analysis)
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
    // LAYER 1: Show in BROWSER
    originalWarn.apply(console, args);
    
    // LAYER 2: Send to unified FRONTEND log
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    sendLog('console.warn', text);
  };
  
  console.error = function(...args) {
    // LAYER 1: Show in BROWSER
    originalError.apply(console, args);
    
    // LAYER 2: Send to unified FRONTEND log
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    sendLog('console.error', text);
  };
}

export { sendLog, DEBUG_ENABLED };
