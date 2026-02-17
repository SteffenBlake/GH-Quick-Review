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
 * Features:
 * - Captures all console.log/warn/error calls
 * - Intercepts ALL HTTP requests (fetch API)
 * - Logs request details: URL, method, headers, body
 * - Logs response details: status, headers, body, cache status, duration
 * - Preserves original console output for DevTools
 * 
 * Usage:
 *   import './utils/debug-logger.js'; // Import once in main.jsx
 *   
 *   // All console.log/warn/error calls are sent to unified log:
 *   console.log('[MUTATION] Starting...'); 
 *   
 *   // All fetch requests are automatically logged:
 *   fetch('/api/data') // Logged with full request/response details
 * 
 * Unified log format:
 *   [timestamp] [BROWSER] [HTTP-REQ] GET /api/data {...}
 *   [timestamp] [BROWSER] [HTTP-RES] GET /api/data → 200 {...}
 *   [timestamp] [BROWSER] [category] message
 *   [timestamp] [TEST] [category] message  
 *   [timestamp] [SERVER] [category] message
 */

const DEBUG_ENABLED = import.meta.env.VITE_DEBUG_LOGGING === '1';
const API_URL = import.meta.env.VITE_GITHUB_API_URL || 'http://localhost:3000';

/**
 * Send a log message to the backend for unified logging
 * Uses original fetch to avoid infinite recursion
 */
const originalFetch = window.fetch;
async function sendLog(category, message, data = null) {
  if (!DEBUG_ENABLED) return;
  
  try {
    await originalFetch(`${API_URL}/debug-log`, {
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
  
  /**
   * Override fetch to intercept and log ALL HTTP requests
   */
  window.fetch = async function(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const startTime = Date.now();
    
    // Log request details
    const requestData = {
      url: String(url),
      method,
      headers: options.headers || {},
      body: options.body || null,
      timestamp: new Date().toISOString()
    };
    
    // Skip logging the debug-log endpoint itself to avoid recursion
    if (!String(url).includes('/debug-log')) {
      sendLog('HTTP-REQ', `${method} ${url}`, requestData);
    }
    
    try {
      // Make the actual request
      const response = await originalFetch(url, options);
      const duration = Date.now() - startTime;
      
      // Clone response so we can read the body without consuming it
      const clonedResponse = response.clone();
      
      // Try to read response body
      let responseBody = null;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          responseBody = await clonedResponse.json();
        } else if (contentType.includes('text/')) {
          responseBody = await clonedResponse.text();
        } else {
          responseBody = '[binary data]';
        }
      } catch (err) {
        responseBody = '[failed to read body]';
      }
      
      // Determine if response came from cache
      const fromCache = response.headers.get('x-cache') === 'HIT' || 
                       (response.type === 'basic' && duration < 10);
      
      // Log response details
      const responseData = {
        url: String(url),
        method,
        status: response.status,
        statusText: response.statusText,
        fromCache,
        duration: `${duration}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        timestamp: new Date().toISOString()
      };
      
      // Skip logging the debug-log endpoint
      if (!String(url).includes('/debug-log')) {
        const cacheIndicator = fromCache ? ' [FROM CACHE]' : '';
        sendLog('HTTP-RES', `${method} ${url} → ${response.status}${cacheIndicator}`, responseData);
      }
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      const errorData = {
        url: String(url),
        method,
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };
      
      if (!String(url).includes('/debug-log')) {
        sendLog('HTTP-ERR', `${method} ${url} → ERROR: ${error.message}`, errorData);
      }
      
      throw error;
    }
  };
}

export { sendLog, DEBUG_ENABLED };
