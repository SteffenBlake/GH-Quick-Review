#!/usr/bin/env node
/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import http from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join, relative } from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

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
    
    // Store project directory path for dynamic diff generation
    this.projectDir = data.project_dir ? resolve(dirname(absolutePath), data.project_dir) : null;
    
    console.log(`Loaded ${this.pulls.size} pull requests and ${this.comments.size} comments`);
    if (this.projectDir) {
      console.log(`Project directory: ${this.projectDir}`);
    }
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
    
    // Handle specific error codes - use GitHub's exact error format
    if (typeof errorConfig === 'number') {
      const errorMessages = {
        400: {
          message: 'Bad Request',
          documentation_url: 'https://docs.github.com/rest'
        },
        401: {
          message: 'Requires authentication',
          documentation_url: 'https://docs.github.com/rest'
        },
        403: {
          message: 'Forbidden',
          documentation_url: 'https://docs.github.com/rest'
        },
        404: {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest'
        },
        422: {
          message: 'Validation Failed',
          documentation_url: 'https://docs.github.com/rest',
          errors: []
        },
        500: {
          message: 'Internal Server Error',
          documentation_url: 'https://docs.github.com/rest'
        },
        503: {
          code: 'service_unavailable',
          message: 'Service unavailable',
          documentation_url: 'https://docs.github.com/rest'
        }
      };
      
      const errorData = errorMessages[errorConfig] || {
        message: 'Error',
        documentation_url: 'https://docs.github.com/rest'
      };
      
      console.log(`  → Configured to return ${errorConfig}`);
      this.sendResponse(res, errorConfig, errorData);
      return true;
    }
    
    return false;
  }

  /**
   * Generate file diff data dynamically using git diff
   * @returns {Array} Array of file objects compatible with GitHub API
   */
  generateFileDiffs() {
    if (!this.projectDir) {
      return [];
    }

    const beforeDir = join(this.projectDir, 'before');
    const afterDir = join(this.projectDir, 'after');

    if (!existsSync(beforeDir) || !existsSync(afterDir)) {
      console.warn('Before or after directory not found');
      return [];
    }

    try {
      // Use git diff --no-index to compare directories
      const diffCommand = `git diff --no-index --numstat --no-color "${beforeDir}" "${afterDir}" || true`;
      const numstatOutput = execSync(diffCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      
      // Get the full diff with patch
      const patchCommand = `git diff --no-index --no-color "${beforeDir}" "${afterDir}" || true`;
      const patchOutput = execSync(patchCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

      return this.parseGitDiff(numstatOutput, patchOutput, beforeDir, afterDir);
    } catch (error) {
      console.error('Error generating diffs:', error.message);
      return [];
    }
  }

  /**
   * Parse git diff output into GitHub API format
   */
  parseGitDiff(numstatOutput, patchOutput, beforeDir, afterDir) {
    const files = [];
    const lines = numstatOutput.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const additions = parseInt(parts[0]) || 0;
      const deletions = parseInt(parts[1]) || 0;
      let filename = parts[2];

      // Extract filename from git paths
      if (filename.includes(' => ')) {
        // Handle renames
        const match = filename.match(/([^\/]+)\/(.+) => ([^\/]+)\/(.+)/);
        if (match) {
          filename = match[4];
        }
      } else {
        // Normal file - extract relative path from after directory
        filename = filename.replace(/^[ab]\//, '').replace(beforeDir + '/', '').replace(afterDir + '/', '');
      }

      // Determine status
      let status = 'modified';
      const afterPath = join(afterDir, filename);
      const beforePath = join(beforeDir, filename);
      
      if (!existsSync(beforePath) && existsSync(afterPath)) {
        status = 'added';
      } else if (existsSync(beforePath) && !existsSync(afterPath)) {
        status = 'removed';
      }

      // Extract patch for this file
      const patch = this.extractFilePatch(patchOutput, filename);

      // Calculate SHA (simplified - using file content hash)
      const sha = this.calculateFileSha(afterPath);

      const fileObj = {
        sha: sha,
        filename: filename,
        status: status,
        additions: additions,
        deletions: deletions,
        changes: additions + deletions,
        blob_url: `https://github.com/testorg/test-repo/blob/abc123/${this.urlEncodePath(filename)}`,
        raw_url: `https://github.com/testorg/test-repo/raw/abc123/${this.urlEncodePath(filename)}`,
        contents_url: `https://api.github.com/repos/testorg/test-repo/contents/${this.urlEncodePath(filename)}?ref=abc123`,
        patch: patch
      };

      files.push(fileObj);
    }

    return files;
  }

  /**
   * Extract patch content for a specific file from full diff output
   */
  extractFilePatch(patchOutput, filename) {
    const lines = patchOutput.split('\n');
    let inFile = false;
    let patchLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is the start of our file's diff
      if (line.startsWith('diff --git') && line.includes(filename)) {
        inFile = true;
        continue;
      }
      
      // Check if we've moved to a different file
      if (inFile && line.startsWith('diff --git') && !line.includes(filename)) {
        break;
      }
      
      // Collect patch lines (skip the diff header lines)
      if (inFile) {
        if (line.startsWith('@@')) {
          patchLines.push(line);
        } else if (patchLines.length > 0 || line.startsWith('@@')) {
          patchLines.push(line);
        }
      }
    }
    
    return patchLines.join('\n');
  }

  /**
   * Calculate SHA for a file (simplified version)
   */
  calculateFileSha(filePath) {
    if (!existsSync(filePath)) {
      return '0000000000000000000000000000000000000000';
    }
    
    try {
      const content = readFileSync(filePath);
      return crypto.createHash('sha1').update(content).digest('hex');
    } catch (error) {
      return '0000000000000000000000000000000000000000';
    }
  }

  /**
   * URL encode file path (convert / to %2F, etc.)
   */
  urlEncodePath(path) {
    return path.split('/').map(part => encodeURIComponent(part)).join('%2F');
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
        // List PR files: GET /repos/{owner}/{repo}/pulls/{pull_number}/files
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/files$/,
        method: 'GET',
        handler: this.listPullFiles.bind(this)
      },
      {
        // Get file contents: GET /repos/{owner}/{repo}/contents/{path}
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/contents\/(.+)$/,
        method: 'GET',
        handler: this.getContents.bind(this)
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
    this.sendResponse(res, 404, {
      message: 'Not Found',
      documentation_url: 'https://docs.github.com/rest'
    });
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
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/pulls#get-a-pull-request'
      });
    }
    
    this.sendResponse(res, 200, pull);
  }

  listPullFiles(req, res, match) {
    if (this.checkConfiguredError('listPullFiles', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    const pull = this.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/pulls#list-pull-requests-files'
      });
    }
    
    // Generate files dynamically from project directory
    const files = this.generateFileDiffs();
    
    this.sendResponse(res, 200, files);
  }

  getContents(req, res, match) {
    if (this.checkConfiguredError('getContents', res)) return;
    
    const [, owner, repo, pathParam] = match;
    
    if (!this.projectDir) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/repos/contents#get-repository-content'
      });
    }

    // Decode the path parameter (URL encoded)
    const decodedPath = decodeURIComponent(pathParam).replace(/%2F/g, '/');
    const filePath = join(this.projectDir, 'after', decodedPath);

    if (!existsSync(filePath)) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/repos/contents#get-repository-content'
      });
    }

    try {
      const stats = statSync(filePath);
      
      if (stats.isDirectory()) {
        // Return directory listing (simplified)
        return this.sendResponse(res, 200, {
          message: 'Directory listing not implemented',
          type: 'dir'
        });
      }

      // Read file content
      const content = readFileSync(filePath);
      
      // Base64 encode with line breaks every 60 characters (matching GitHub's format)
      const base64Content = content.toString('base64').match(/.{1,60}/g).join('\n');
      const sha = this.calculateFileSha(filePath);
      
      // Use a consistent ref SHA for URLs
      const refSha = 'abc123def456789012345678901234567890abcd';

      const response = {
        name: decodedPath.split('/').pop(),
        path: decodedPath,
        sha: sha,
        size: stats.size,
        url: `https://api.github.com/repos/${owner}/${repo}/contents/${this.urlEncodePath(decodedPath)}?ref=${refSha}`,
        html_url: `https://github.com/${owner}/${repo}/blob/${refSha}/${this.urlEncodePath(decodedPath)}`,
        git_url: `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${refSha}/${this.urlEncodePath(decodedPath)}`,
        type: 'file',
        content: base64Content,
        encoding: 'base64',
        _links: {
          self: `https://api.github.com/repos/${owner}/${repo}/contents/${this.urlEncodePath(decodedPath)}?ref=${refSha}`,
          git: `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
          html: `https://github.com/${owner}/${repo}/blob/${refSha}/${this.urlEncodePath(decodedPath)}`
        }
      };

      this.sendResponse(res, 200, response);
    } catch (error) {
      console.error('Error reading file:', error);
      this.sendResponse(res, 500, {
        message: 'Internal Server Error',
        documentation_url: 'https://docs.github.com/rest'
      });
    }
  }

  listComments(req, res, match) {
    if (this.checkConfiguredError('listComments', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    const pull = this.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/comments#list-review-comments-on-a-pull-request'
      });
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
        return this.sendResponse(res, 404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/pulls/comments#create-a-review-comment-for-a-pull-request'
        });
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
        return this.sendResponse(res, 404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/pulls/comments#update-a-review-comment-for-a-pull-request'
        });
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
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/comments#delete-a-review-comment-for-a-pull-request'
      });
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
function startServer(dataFile = resolve(__dirname, 'test-data.json'), port = 3000, config = {}) {
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
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/files`);
    console.log(`  GET    /repos/{owner}/{repo}/contents/{path}`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
    console.log(`  POST   /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
    console.log(`  PATCH  /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
    console.log(`  DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
    console.log(`\nPress Ctrl+C to stop\n`);
  });
  
  const close = (callback) => {
    server.close(callback);
  };
  
  return { server, close };
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const dataFile = args[0] || resolve(__dirname, 'test-data.json');
  const port = parseInt(args[1]) || 3000;
  const { server } = startServer(dataFile, port);
}

export { GitHubMockServer, startServer };
export default GitHubMockServer;
