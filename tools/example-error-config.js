#!/usr/bin/env node

/**
 * Example test script demonstrating error configuration
 * 
 * This shows how to use the error configuration feature to test
 * negative cases and ensure your app handles failures gracefully.
 */

import { GitHubMockServer, startServer } from './gh-mock-server.js';
import http from 'http';

// Example 1: Start server with error configuration programmatically
console.log('Example 1: Programmatic server with error config\n');

const errorConfig = {
  listPulls: 404,      // List PRs will return 404
  getPull: 500,        // Get PR will return 500
  addComment: 403,     // Add comment will return 403
  listComments: 'timeout' // List comments will timeout
};

console.log('Starting server with error configuration:', errorConfig);
const server = startServer('./test-data.json', 3100, errorConfig);

// Wait a bit then close
setTimeout(() => {
  console.log('\nClosing example server...\n');
  server.close();
  
  // Example 2: Create custom server instance
  console.log('Example 2: Custom server instance\n');
  
  const mockServer = new GitHubMockServer('./test-data.json', {
    getPull: 404  // Only this endpoint will error
  });
  
  const customServer = http.createServer((req, res) => {
    mockServer.handleRequest(req, res);
  });
  
  customServer.listen(3101, () => {
    console.log('Custom server running on port 3101');
    console.log('Only getPull endpoint configured to return 404\n');
    
    setTimeout(() => {
      customServer.close();
      console.log('Done!');
    }, 2000);
  });
}, 2000);
