#!/usr/bin/env node

import http from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitHubMockServer {
  constructor(dataFilePath, config = {}) {
    this.dataFilePath = dataFilePath;
    this.config = config;
    this.loadData();
  }

  loadData() {
    const absolutePath = resolve(this.dataFilePath);
    const rawData = readFileSync(absolutePath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Initialize in-memory state from loaded data
    this.pulls = new Map(data.pulls.map(pr => [pr.number, { ...pr }]));
    this.comments = new Map(data.comments.map(comment => [comment.id, { ...comment }]));
    this.nextCommentId = Math.max(...data.comments.map(c => c.id), 0) + 1;
    
    console.log(`Loaded ${this.pulls.size} pull requests and ${this.comments.size} comments`);
  }

  /**
   * Check if endpoint should return an error based on config
   * @param {string} endpointName - Name of the endpoint (e.g., 'listPulls', 'getPull')
   * @param {object} res - HTTP response object
   * @returns {boolean} - true if error was handled, false otherwise
   */
  checkConfiguredError(endpointName, res) {
    const errorConfig = this.config[endpointName];
    
    if (!errorConfig) {
      return false;
    }
    
    // Handle timeout - don't respond at all
    if (errorConfig === 'timeout') {
      console.log(`  → Configured to timeout (no response)`);
      // Don't send any response - let it hang
      return true;
    }
    
    // Handle specific error codes
    if (typeof errorConfig === 'number') {
      const errorMessages = {
        400: { message: 'Bad Request' },
        401: { message: 'Requires authentication' },
        403: { message: 'Forbidden' },
        404: { message: 'Not Found' },
        422: { message: 'Validation failed', errors: [] },
        500: { message: 'Internal Server Error' },
        503: { message: 'Service unavailable' }
      };
      
      const errorData = errorMessages[errorConfig] || { message: 'Error' };
      console.log(`  → Configured to return ${errorConfig}`);
      this.sendResponse(res, errorConfig, errorData);
      return true;
    }
    
    return false;
  }

  handleRequest(req, res) {
    const { method, url } = req;
    
    // Parse URL and extract path
    const urlParts = url.split('?');
    const path = urlParts[0];
    
    console.log(`${method} ${path}`);
    
    // Route matching
    const routes = [
      {
        // List PRs: GET /repos/{owner}/{repo}/pulls
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls$/,
        method: 'GET',
        handler: this.listPulls.bind(this)
      },
      {
        // Read PR: GET /repos/{owner}/{repo}/pulls/{pull_number}
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)$/,
        method: 'GET',
        handler: this.getPull.bind(this)
      },
      {
        // List review comments: GET /repos/{owner}/{repo}/pulls/{pull_number}/comments
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/comments$/,
        method: 'GET',
        handler: this.listComments.bind(this)
      },
      {
        // Add review comment: POST /repos/{owner}/{repo}/pulls/{pull_number}/comments
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/comments$/,
        method: 'POST',
        handler: this.addComment.bind(this)
      },
      {
        // Edit review comment: PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/comments\/(\d+)$/,
        method: 'PATCH',
        handler: this.editComment.bind(this)
      },
      {
        // Delete review comment: DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/comments\/(\d+)$/,
        method: 'DELETE',
        handler: this.deleteComment.bind(this)
      }
    ];
    
    // Find matching route
    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match && method === route.method) {
        return route.handler(req, res, match);
      }
    }
    
    // No route matched
    this.sendResponse(res, 404, { message: 'Not Found' });
  }

  listPulls(req, res, match) {
    if (this.checkConfiguredError('listPulls', res)) return;
    
    const [, owner, repo] = match;
    const pulls = Array.from(this.pulls.values());
    this.sendResponse(res, 200, pulls);
  }

  getPull(req, res, match) {
    if (this.checkConfiguredError('getPull', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    const pull = this.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, { message: 'Not Found' });
    }
    
    this.sendResponse(res, 200, pull);
  }

  listComments(req, res, match) {
    if (this.checkConfiguredError('listComments', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    const pull = this.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, { message: 'Pull request not found' });
    }
    
    // Get all comments for this PR
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.pull_number === parseInt(pullNumber));
    
    this.sendResponse(res, 200, comments);
  }

  addComment(req, res, match) {
    if (this.checkConfiguredError('addComment', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    
    this.readBody(req, (body) => {
      const pull = this.pulls.get(parseInt(pullNumber));
      
      if (!pull) {
        return this.sendResponse(res, 404, { message: 'Pull request not found' });
      }
      
      const newComment = {
        id: this.nextCommentId++,
        pull_number: parseInt(pullNumber),
        diff_hunk: body.diff_hunk || '',
        path: body.path || '',
        position: body.position || null,
        original_position: body.original_position || null,
        commit_id: body.commit_id || pull.head.sha,
        original_commit_id: body.original_commit_id || pull.head.sha,
        user: {
          login: 'test-user',
          id: 1,
          type: 'User'
        },
        body: body.body || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        html_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}#discussion_r${this.nextCommentId - 1}`,
        pull_request_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
        line: body.line || null,
        side: body.side || 'RIGHT',
        start_line: body.start_line || null,
        start_side: body.start_side || null,
        in_reply_to_id: body.in_reply_to_id || null
      };
      
      this.comments.set(newComment.id, newComment);
      this.sendResponse(res, 201, newComment);
    });
  }

  editComment(req, res, match) {
    if (this.checkConfiguredError('editComment', res)) return;
    
    const [, owner, repo, commentId] = match;
    
    this.readBody(req, (body) => {
      const comment = this.comments.get(parseInt(commentId));
      
      if (!comment) {
        return this.sendResponse(res, 404, { message: 'Not Found' });
      }
      
      // Update comment
      if (body.body !== undefined) {
        comment.body = body.body;
      }
      comment.updated_at = new Date().toISOString();
      
      this.sendResponse(res, 200, comment);
    });
  }

  deleteComment(req, res, match) {
    if (this.checkConfiguredError('deleteComment', res)) return;
    
    const [, owner, repo, commentId] = match;
    const comment = this.comments.get(parseInt(commentId));
    
    if (!comment) {
      return this.sendResponse(res, 404, { message: 'Not Found' });
    }
    
    this.comments.delete(parseInt(commentId));
    this.sendResponse(res, 204, null);
  }

  readBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        callback(parsed);
      } catch (error) {
        callback({});
      }
    });
  }

  sendResponse(res, statusCode, data) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = statusCode;
    
    if (statusCode === 204) {
      res.end();
    } else {
      res.end(JSON.stringify(data, null, 2));
    }
  }
}

// Main execution
function startServer(dataFile, port, config) {
  dataFile = dataFile || resolve(__dirname, 'test-data.json');
  port = port || 3000;
  config = config || {};
  
  console.log(`Starting GitHub Mock Server...`);
  console.log(`Data file: ${dataFile}`);
  console.log(`Port: ${port}`);
  if (Object.keys(config).length > 0) {
    console.log(`Error config:`, JSON.stringify(config, null, 2));
  }
  
  const mockServer = new GitHubMockServer(dataFile, config);
  
  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.statusCode = 204;
      res.end();
      return;
    }
    
    mockServer.handleRequest(req, res);
  });
  
  server.listen(port, () => {
    console.log(`\n✓ GitHub Mock Server running on http://localhost:${port}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
    console.log(`  POST   /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
    console.log(`  PATCH  /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
    console.log(`  DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
    console.log(`\nPress Ctrl+C to stop\n`);
  });
  
  return server;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const dataFile = args[0] || resolve(__dirname, 'test-data.json');
  const port = parseInt(args[1]) || 3000;
  startServer(dataFile, port);
}

export { GitHubMockServer, startServer };
export default GitHubMockServer;
