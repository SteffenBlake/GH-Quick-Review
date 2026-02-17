/**
 * Unified Debug Logger
 * 
 * Provides a clean API for logging from different layers of the application.
 * All logs are written to /tmp/unified-debug.log when VITE_DEBUG_LOGGING=1 is set.
 * 
 * Three-layer logging system:
 * 1. WEBSITE (browser): Logs from the web application running in the browser
 * 2. TEST: Logs from Playwright test code
 * 3. SERVER: Logs from the mock server backend
 * 
 * Usage in Production Code:
 *   import { debugLogger } from '../utils/debug-logger.js';
 *   
 *   // Website logs (from browser app):
 *   debugLogger.website.log('[HTTP] Request:', method, url);
 *   debugLogger.website.error('[MUTATION] ERROR:', errorMessage);
 *   
 *   // Test logs (from Playwright tests):
 *   debugLogger.test.log('[TEST] Starting test scenario');
 *   debugLogger.test.error('[TEST] Assertion failed:', details);
 *   
 *   // Server logs (from mock server):
 *   debugLogger.server.log('[SERVER] Handling request:', endpoint);
 *   debugLogger.server.error('[SERVER] Error:', error);
 * 
 * Features:
 * - Clean API - no DEBUG_ENABLED checks in production code
 * - Tree-shakeable - no-ops when VITE_DEBUG_LOGGING !== '1'
 * - Automatic HTTP request/response interception (when enabled)
 * - Unified log file with timestamps and source prefixes
 * - Preserves original console output for DevTools
 * 
 * Environment Setup:
 * - Development: Set VITE_DEBUG_LOGGING=1 in .env.development
 * - Tests: Set VITE_DEBUG_LOGGING=1 in .env.test
 * - Production: Leave unset (logging will be tree-shaken out)
 * 
 * The debug logger is automatically initialized when imported in main.jsx.
 * It overrides console methods and fetch when DEBUG_ENABLED=true.
 */

const DEBUG_ENABLED = import.meta.env.VITE_DEBUG_LOGGING === '1';
const API_URL = import.meta.env.VITE_DEBUG_LOGGING === '1' 
  ? (import.meta.env.VITE_GITHUB_API_URL || 'http://localhost:3000')
  : '';

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

/**
 * Public Debug Logger API
 * 
 * Provides clean logging methods for different application layers.
 * When DEBUG_ENABLED is false, these are replaced with no-op functions
 * that get tree-shaken out of production builds.
 */

// Create real logger for development/testing
const createRealLogger = (source) => ({
  log: (...args) => {
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Parse [CATEGORY] prefix if present
    const match = text.match(/^\[([^\]]+)\]\s*(.+)/);
    if (match) {
      sendLog(match[1], match[2]);
    } else {
      sendLog(`${source}`, text);
    }
  },
  
  error: (...args) => {
    const text = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Parse [CATEGORY] prefix if present, add .error suffix
    const match = text.match(/^\[([^\]]+)\]\s*(.+)/);
    if (match) {
      sendLog(`${match[1]}.error`, match[2]);
    } else {
      sendLog(`${source}.error`, text);
    }
  }
});

// Tree-shake friendly: Use explicit if/else for better dead code elimination
let debugLogger;

if (DEBUG_ENABLED) {
  // Real logger implementation - only included when DEBUG_ENABLED is true  
  debugLogger = {
    website: createRealLogger('WEBSITE'),
    server: createRealLogger('SERVER'),
    test: createRealLogger('TEST')
  };
} else {
  // No-op logger for production - will be tree-shaken out
  const noOp = () => {};
  debugLogger = {
    website: { log: noOp, error: noOp },
    server: { log: noOp, error: noOp },
    test: { log: noOp, error: noOp }
  };
}

export { debugLogger, sendLog, DEBUG_ENABLED };
