import { startServer } from '../../tools/gh-mock-server.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MockServerManager {
  constructor() {
    this.server = null;
    this.port = 3000; // Shared mock server port
  }

  async checkHeartbeat() {
    if (!this.port) {
      throw new Error('Mock server not started - no port available');
    }
    
    const url = `http://localhost:${this.port}/heartbeat`;
    const maxAttempts = 20; // Retry for shared server
    const delayMs = 500;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) {
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
          throw new Error(`Heartbeat failed with status ${response.status}`);
        }
        
        const data = await response.json();
        if (data.status !== 'ok') {
          throw new Error(`Heartbeat returned unexpected status: ${data.status}`);
        }
        
        return true;
      } catch (error) {
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        throw new Error(`Mock server heartbeat failed: ${error.message}`);
      }
    }
  }

  async stop() {
    // Never stop shared server - it's managed by Playwright's webServer config
    // This is a no-op for compatibility with existing tests
    return;
  }

  /**
   * Reset the shared mock server data to original state
   * Only works with shared server (parallel tests)
   */
  async reset() {
    if (!this.port) {
      throw new Error('Mock server not available - no port');
    }
    
    try {
      const response = await fetch(`http://localhost:${this.port}/reset`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Reset failed with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(`Reset returned unexpected status: ${data.status}`);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Mock server reset failed: ${error.message}`);
    }
  }

  /**
   * Configure mock server error responses and latency
   * @param {Object} config - Configuration object with errors and/or latency
   * @param {Object} config.errors - Object mapping endpoint names to error codes (e.g., { listPulls: 500 })
   * @param {number} config.latency - Artificial latency in milliseconds
   */
  async setConfig(config) {
    if (!this.port) {
      throw new Error('Mock server not available - no port');
    }
    
    try {
      const response = await fetch(`http://localhost:${this.port}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`Config failed with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(`Config returned unexpected status: ${data.status}`);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Mock server config failed: ${error.message}`);
    }
  }

  getPort() {
    return this.port;
  }
}
