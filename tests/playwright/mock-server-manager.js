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

  async start(dataFile = null, port = 0, config = {}) {
    const testDataFile = dataFile || resolve(__dirname, '../../tools/test-data.json');
    
    return new Promise((resolvePromise, reject) => {
      try {
        const { server, close } = startServer(testDataFile, port, config);
        
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
