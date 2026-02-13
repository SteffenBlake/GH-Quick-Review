import { startServer } from '../../tools/gh-mock-server.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MockServerManager {
  constructor() {
    this.server = null;
    this.port = null;
  }

  async start(userDirPath = null, port = 0, config = {}) {
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500); // 500ms timeout
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`Heartbeat failed with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(`Heartbeat returned unexpected status: ${data.status}`);
      }
      
      return true;
    } catch (error) {
      clearTimeout(timeout);
      throw new Error(`Mock server heartbeat failed: ${error.message}`);
    }
  }

  async stop() {
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

  getPort() {
    return this.port;
  }
}
