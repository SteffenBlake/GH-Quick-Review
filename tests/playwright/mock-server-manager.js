import { startServer } from '../../tools/gh-mock-server.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MockServerManager {
  constructor() {
    this.server = null;
    this.port = null;
    this.useSharedServer = false; // Flag for parallel tests
  }

  /**
   * Start mock server
   * For parallel tests, set useShared=true to skip starting and use the globally started server
   */
  async start(userDirPath = null, port = 0, config = {}, useShared = false) {
    if (useShared) {
      // For parallel tests: use the shared mock server started by webServer config
      this.useSharedServer = true;
      this.port = port || 3000; // Default to 3000 for shared server
      
      // Wait for shared server to be ready
      await this.checkHeartbeat();
      return this.port;
    }
    
    // For serial tests: start dedicated mock server
    const testUserDir = userDirPath || resolve(__dirname, '../../tools/test_user');
    
    // Always run in silent mode during tests to reduce output spam
    const testConfig = { ...config, silent: true };
    
    return new Promise((resolvePromise, reject) => {
      try {
        const { server, close } = startServer(testUserDir, port, testConfig);
        
        server.on('listening', () => {
          const address = server.address();
          this.port = address.port;
          this.server = server;
          this.close = close;
          resolvePromise(this.port);
        });

        server.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async checkHeartbeat() {
    if (!this.port) {
      throw new Error('Mock server not started - no port available');
    }
    
    const url = `http://localhost:${this.port}/heartbeat`;
    
    // For shared server, wait longer and retry
    const maxAttempts = this.useSharedServer ? 20 : 1;
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
    // Don't stop shared server
    if (this.useSharedServer) {
      this.port = null;
      return;
    }
    
    if (this.server && this.close) {
      return new Promise((resolve) => {
        this.close(() => {
          this.server = null;
          this.port = null;
          this.close = null;
          resolve();
        });
      });
    }
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

  getPort() {
    return this.port;
  }
}
