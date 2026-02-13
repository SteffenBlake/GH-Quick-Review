#!/usr/bin/env node
/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import http from 'http';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join, relative } from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitHubMockServer {
  constructor(userDirPath, config = {}) {
    this.userDirPath = userDirPath;
    this.config = config;
    this.latency = config.latency || 0; // Artificial delay in ms
    this.loadUserData();
  }

  loadUserData() {
    const absolutePath = resolve(this.userDirPath);
    
    // Dynamically build repos list from directory structure
    this.repos = this.scanRepositories(absolutePath);
    
    // Cache for repo data (loaded on demand)
    this.repoDataCache = new Map();
    
    console.log(`Loaded ${this.repos.length} repositories for user`);
  }

  /**
   * Scan directory structure to build list of repositories
   */
  scanRepositories(userDir) {
    const repos = [];
    
    if (!existsSync(userDir)) {
      return repos;
    }

    const entries = readdirSync(userDir);
    
    for (const entry of entries) {
      const entryPath = join(userDir, entry);
      const stats = statSync(entryPath);
      
      // Skip files and look only at directories
      if (!stats.isDirectory()) {
        continue;
      }
      
      // Check if this directory has a data.json file (indicating it's a repo)
      const dataJsonPath = join(entryPath, 'data.json');
      if (!existsSync(dataJsonPath)) {
        continue;
      }
      
      // Load basic metadata from data.json
      try {
        const data = JSON.parse(readFileSync(dataJsonPath, 'utf8'));
        const pulls = data.pulls || [];
        
        // Count open issues (open PRs)
        const openIssuesCount = pulls.filter(pr => pr.state === 'open').length;
        
        // Find latest update time
        const latestUpdate = pulls.reduce((latest, pr) => {
          const prUpdate = new Date(pr.updated_at);
          return prUpdate > latest ? prUpdate : latest;
        }, new Date(0));
        
        // Determine primary language (simplified - could be from first PR or default)
        const language = pulls.length > 0 ? this.guessLanguageFromRepo(entryPath) : 'Unknown';
        
        repos.push({
          id: repos.length + 1,
          node_id: `R_kgDO${entry}`,
          name: entry,
          full_name: `test_user/${entry}`,
          owner: {
            login: 'test_user',
            id: 1000,
            node_id: 'U_kgDOTestUser',
            avatar_url: 'https://avatars.githubusercontent.com/u/1000?v=4',
            type: 'User'
          },
          private: false,
          html_url: `https://github.com/test_user/${entry}`,
          description: `Test repository ${entry}`,
          fork: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: latestUpdate.toISOString(),
          pushed_at: latestUpdate.toISOString(),
          homepage: '',
          size: 256,
          stargazers_count: repos.length + 1,
          watchers_count: repos.length + 1,
          language: language,
          has_issues: true,
          has_projects: true,
          has_downloads: true,
          has_wiki: true,
          has_pages: false,
          has_discussions: false,
          forks_count: 0,
          archived: false,
          disabled: false,
          open_issues_count: openIssuesCount,
          license: {
            key: 'mit',
            name: 'MIT License',
            spdx_id: 'MIT',
            url: 'https://api.github.com/licenses/mit'
          },
          topics: ['testing'],
          visibility: 'public',
          default_branch: 'main'
        });
      } catch (error) {
        console.warn(`Failed to load repository metadata for ${entry}:`, error.message);
      }
    }
    
    return repos;
  }

  /**
   * Guess primary language from files in repository
   */
  guessLanguageFromRepo(repoPath) {
    // Look for files in PR directories to determine language
    const prDirs = readdirSync(repoPath).filter(name => !isNaN(name));
    
    for (const prDir of prDirs) {
      const afterDir = join(repoPath, prDir, 'after');
      if (existsSync(afterDir)) {
        const files = readdirSync(afterDir);
        
        // Check file extensions
        for (const file of files) {
          if (file.endsWith('.js')) return 'JavaScript';
          if (file.endsWith('.py')) return 'Python';
          if (file.endsWith('.cs')) return 'C#';
          if (file.endsWith('.java')) return 'Java';
          if (file.endsWith('.yaml') || file.endsWith('.yml')) return 'YAML';
          if (file.endsWith('.json')) return 'JSON';
          if (file.endsWith('.html')) return 'HTML';
          if (file.endsWith('.xml')) return 'XML';
        }
      }
    }
    
    return 'Unknown';
  }

  /**
   * Load data for a specific repository
   */
  loadRepoData(repoName) {
    if (this.repoDataCache.has(repoName)) {
      return this.repoDataCache.get(repoName);
    }

    const repoPath = join(this.userDirPath, repoName);
    const dataPath = join(repoPath, 'data.json');

    if (!existsSync(dataPath)) {
      console.warn(`Data file not found for repo: ${repoName}`);
      return { pulls: new Map(), comments: new Map(), nextCommentId: 1 };
    }

    const rawData = readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    const repoData = {
      pulls: new Map(data.pulls.map(pr => [pr.number, { ...pr }])),
      comments: new Map(data.comments.map(comment => [comment.id, { ...comment }])),
      reviews: new Map((data.reviews || []).map(review => [review.id, { ...review }])),
      nextCommentId: Math.max(...data.comments.map(c => c.id), 0) + 1,
      nextReviewId: Math.max(...(data.reviews || []).map(r => r.id), 0) + 1
    };

    this.repoDataCache.set(repoName, repoData);
    console.log(`Loaded ${repoData.pulls.size} PRs, ${repoData.comments.size} comments, and ${repoData.reviews.size} reviews for ${repoName}`);
    return repoData;
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
   * @param {string} repoName - Repository name
   * @param {number} pullNumber - Pull request number
   * @returns {Array} Array of file objects compatible with GitHub API
   */
  generateFileDiffs(repoName, pullNumber) {
    const prDir = join(this.userDirPath, repoName, String(pullNumber));
    const beforeDir = join(prDir, 'before');
    const afterDir = join(prDir, 'after');

    if (!existsSync(beforeDir) || !existsSync(afterDir)) {
      console.warn(`Before or after directory not found for ${repoName} PR ${pullNumber}`);
      return [];
    }

    try {
      // Use git diff --no-index to compare directories
      const diffCommand = `git diff --no-index --numstat --no-color "${beforeDir}" "${afterDir}" || true`;
      const numstatOutput = execSync(diffCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      
      // Get the full diff with patch
      const patchCommand = `git diff --no-index --no-color "${beforeDir}" "${afterDir}" || true`;
      const patchOutput = execSync(patchCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

      // Extract owner from repo (assumes format owner/repo_name or just repo_name)
      const owner = 'test_user';
      
      return this.parseGitDiff(numstatOutput, patchOutput, beforeDir, afterDir, owner, repoName);
    } catch (error) {
      console.error('Error generating diffs:', error.message);
      return [];
    }
  }

  /**
   * Parse git diff output into GitHub API format
   * @param {string} owner - Repository owner
   * @param {string} repoName - Repository name
   */
  parseGitDiff(numstatOutput, patchOutput, beforeDir, afterDir, owner, repoName) {
    const files = [];
    const lines = numstatOutput.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const additions = parseInt(parts[0]) || 0;
      const deletions = parseInt(parts[1]) || 0;
      let rawPath = parts[2];

      let filename = '';
      let status = 'modified';

      // Handle git diff output patterns
      if (rawPath.includes(' => ')) {
        // Pattern 1: "{before => after}/filename" - modified file
        if (rawPath.match(/\{[^}]+\}\/(.+)/)) {
          const match = rawPath.match(/\{[^}]+\}\/(.+)/);
          filename = match[1];
          status = 'modified';
        }
        // Pattern 2: "/dev/null => after/filename" - added file
        else if (rawPath.includes('/dev/null =>')) {
          // Extract path after 'after/' directory
          const match = rawPath.match(/\/dev\/null => .*?\/after\/(.+)/);
          if (match) {
            filename = match[1];
            status = 'added';
          }
        }
        // Pattern 3: "before/filename => /dev/null" - deleted file
        else if (rawPath.includes('=> /dev/null')) {
          // Extract path after 'before/' directory
          const match = rawPath.match(/.*?\/before\/(.+) => \/dev\/null/);
          if (match) {
            filename = match[1];
            status = 'removed';
          }
        }
        // Pattern 4: "before/file => after/newfile" - renamed file
        else {
          // Extract path after 'after/' directory
          const match = rawPath.match(/=> .*?\/after\/(.+)/);
          if (match) {
            filename = match[1];
            status = 'renamed';
          }
        }
      } else {
        // Simple path without arrow - shouldn't happen with git diff --no-index but handle it
        filename = rawPath.split('/').pop();
        const potentialBeforePath = join(beforeDir, filename);
        const potentialAfterPath = join(afterDir, filename);
        
        if (existsSync(potentialBeforePath) && existsSync(potentialAfterPath)) {
          status = 'modified';
        } else if (existsSync(potentialAfterPath)) {
          status = 'added';
        } else if (existsSync(potentialBeforePath)) {
          status = 'removed';
        }
      }

      // Extract patch for this file
      const patch = this.extractFilePatch(patchOutput, filename);

      // Calculate SHA (simplified - using file content hash)
      const sha = status === 'removed' 
        ? this.calculateFileSha(join(beforeDir, filename))
        : this.calculateFileSha(join(afterDir, filename));

      const fileObj = {
        sha: sha,
        filename: filename,
        status: status,
        additions: additions,
        deletions: deletions,
        changes: additions + deletions,
        blob_url: `https://github.com/${owner}/${repoName}/blob/abc123/${this.urlEncodePath(filename)}`,
        raw_url: `https://github.com/${owner}/${repoName}/raw/abc123/${this.urlEncodePath(filename)}`,
        contents_url: `https://api.github.com/repos/${owner}/${repoName}/contents/${this.urlEncodePath(filename)}?ref=abc123`,
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

  async handleRequest(req, res) {
    const { method, url } = req;
    
    // Parse URL and extract path
    const urlParts = url.split('?');
    const path = urlParts[0];
    
    console.log(`${method} ${path}`);
    
    // Route matching
    const routes = [
      {
        // Get authenticated user: GET /user
        pattern: /^\/user$/,
        method: 'GET',
        handler: this.getUser.bind(this)
      },
      {
        // List repos for user: GET /user/repos
        pattern: /^\/user\/repos$/,
        method: 'GET',
        handler: this.listUserRepos.bind(this)
      },
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
      },
      {
        // List reviews: GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/reviews$/,
        method: 'GET',
        handler: this.listReviews.bind(this)
      },
      {
        // Create review: POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/reviews$/,
        method: 'POST',
        handler: this.createReview.bind(this)
      },
      {
        // Add comment to review: POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/reviews\/(\d+)\/comments$/,
        method: 'POST',
        handler: this.addReviewComment.bind(this)
      },
      {
        // Submit review: POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events
        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/reviews\/(\d+)\/events$/,
        method: 'POST',
        handler: this.submitReview.bind(this)
      },
      {
        // GraphQL endpoint: POST /graphql
        pattern: /^\/graphql$/,
        method: 'POST',
        handler: this.handleGraphQL.bind(this)
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

  listUserRepos(req, res, match) {
    if (this.checkConfiguredError('listUserRepos', res)) return;
    
    // Check for authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return this.sendResponse(res, 401, {
        message: 'Requires authentication',
        documentation_url: 'https://docs.github.com/rest/reference/repos#list-repositories-for-the-authenticated-user'
      });
    }
    
    this.sendResponse(res, 200, this.repos);
  }

  getUser(req, res, match) {
    if (this.checkConfiguredError('getUser', res)) return;
    
    // Check for authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return this.sendResponse(res, 401, {
        message: 'Requires authentication',
        documentation_url: 'https://docs.github.com/rest/users/users#get-the-authenticated-user'
      });
    }
    
    // Return authenticated user info (reviewer1 so they match comments in test data)
    const userData = {
      login: 'reviewer1',
      id: 201,
      node_id: 'U_kgDOReviewer1',
      avatar_url: 'https://avatars.githubusercontent.com/u/201?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/reviewer1',
      html_url: 'https://github.com/reviewer1',
      followers_url: 'https://api.github.com/users/reviewer1/followers',
      following_url: 'https://api.github.com/users/reviewer1/following{/other_user}',
      gists_url: 'https://api.github.com/users/reviewer1/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/reviewer1/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/reviewer1/subscriptions',
      organizations_url: 'https://api.github.com/users/reviewer1/orgs',
      repos_url: 'https://api.github.com/users/reviewer1/repos',
      events_url: 'https://api.github.com/users/reviewer1/events{/privacy}',
      received_events_url: 'https://api.github.com/users/reviewer1/received_events',
      type: 'User',
      site_admin: false,
      name: 'Reviewer One',
      company: null,
      blog: '',
      location: 'Test Location',
      email: 'reviewer1@example.com',
      hireable: null,
      bio: 'Test reviewer for GH Quick Review',
      twitter_username: null,
      public_repos: 0,
      public_gists: 0,
      followers: 0,
      following: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };
    
    this.sendResponse(res, 200, userData);
  }

  listPulls(req, res, match) {
    if (this.checkConfiguredError('listPulls', res)) return;
    
    const [, owner, repo] = match;
    const repoData = this.loadRepoData(repo);
    const pulls = Array.from(repoData.pulls.values());
    this.sendResponse(res, 200, pulls);
  }

  getPull(req, res, match) {
    if (this.checkConfiguredError('getPull', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    const repoData = this.loadRepoData(repo);
    const pull = repoData.pulls.get(parseInt(pullNumber));
    
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
    const repoData = this.loadRepoData(repo);
    const pull = repoData.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/pulls#list-pull-requests-files'
      });
    }
    
    // Generate files dynamically from project directory
    const files = this.generateFileDiffs(repo, parseInt(pullNumber));
    
    this.sendResponse(res, 200, files);
  }

  getContents(req, res, match) {
    if (this.checkConfiguredError('getContents', res)) return;
    
    const [, owner, repo, pathParam] = match;

    // Get the query parameters to determine which PR to use (default to latest)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const ref = url.searchParams.get('ref');
    
    // For simplicity, we'll look in the "after" directory of PR 1 by default
    // In a real implementation, you'd parse the ref to determine the correct PR
    const prNumber = 1; // Default to PR 1
    const prDir = join(this.userDirPath, repo, String(prNumber));
    const afterDir = join(prDir, 'after');

    // Decode the path parameter (URL encoded)
    const decodedPath = decodeURIComponent(pathParam).replace(/%2F/g, '/');
    const filePath = join(afterDir, decodedPath);

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
      const refSha = ref || 'abc123def456789012345678901234567890abcd';

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
    const repoData = this.loadRepoData(repo);
    const pull = repoData.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/comments#list-review-comments-on-a-pull-request'
      });
    }
    
    // Get all comments for this PR
    const comments = Array.from(repoData.comments.values())
      .filter(comment => comment.pull_number === parseInt(pullNumber));
    
    this.sendResponse(res, 200, comments);
  }

  addComment(req, res, match) {
    if (this.checkConfiguredError('addComment', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    
    this.readBody(req, (body) => {
      const repoData = this.loadRepoData(repo);
      const pull = repoData.pulls.get(parseInt(pullNumber));
      
      if (!pull) {
        return this.sendResponse(res, 404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/pulls/comments#create-a-review-comment-for-a-pull-request'
        });
      }
      
      const newComment = {
        id: repoData.nextCommentId++,
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
        html_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}#discussion_r${repoData.nextCommentId - 1}`,
        pull_request_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
        line: body.line || null,
        side: body.side || 'RIGHT',
        start_line: body.start_line || null,
        start_side: body.start_side || null,
        in_reply_to_id: body.in_reply_to_id || null
      };
      
      repoData.comments.set(newComment.id, newComment);
      this.sendResponse(res, 201, newComment);
    });
  }

  editComment(req, res, match) {
    if (this.checkConfiguredError('editComment', res)) return;
    
    const [, owner, repo, commentId] = match;
    
    this.readBody(req, (body) => {
      // Find the comment across all repos
      let comment = null;
      let foundRepoData = null;
      
      for (const [repoName, repoData] of this.repoDataCache.entries()) {
        comment = repoData.comments.get(parseInt(commentId));
        if (comment) {
          foundRepoData = repoData;
          break;
        }
      }
      
      // If not in cache, try loading from the specific repo
      if (!comment) {
        const repoData = this.loadRepoData(repo);
        comment = repoData.comments.get(parseInt(commentId));
        foundRepoData = repoData;
      }
      
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
    
    // Find the comment across all repos
    let found = false;
    
    for (const [repoName, repoData] of this.repoDataCache.entries()) {
      if (repoData.comments.has(parseInt(commentId))) {
        repoData.comments.delete(parseInt(commentId));
        found = true;
        break;
      }
    }
    
    // If not in cache, try loading from the specific repo
    if (!found) {
      const repoData = this.loadRepoData(repo);
      if (repoData.comments.has(parseInt(commentId))) {
        repoData.comments.delete(parseInt(commentId));
        found = true;
      }
    }
    
    if (!found) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/comments#delete-a-review-comment-for-a-pull-request'
      });
    }
    
    this.sendResponse(res, 204, null);
  }

  listReviews(req, res, match) {
    if (this.checkConfiguredError('listReviews', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    const repoData = this.loadRepoData(repo);
    const pull = repoData.pulls.get(parseInt(pullNumber));
    
    if (!pull) {
      return this.sendResponse(res, 404, {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest/pulls/reviews#list-reviews-for-a-pull-request'
      });
    }
    
    // Get all reviews for this PR
    const reviews = Array.from(repoData.reviews.values())
      .filter(review => review.pull_number === parseInt(pullNumber));
    
    this.sendResponse(res, 200, reviews);
  }

  createReview(req, res, match) {
    if (this.checkConfiguredError('createReview', res)) return;
    
    const [, owner, repo, pullNumber] = match;
    
    this.readBody(req, (body) => {
      const repoData = this.loadRepoData(repo);
      const pull = repoData.pulls.get(parseInt(pullNumber));
      
      if (!pull) {
        return this.sendResponse(res, 404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/pulls/reviews#create-a-review-for-a-pull-request'
        });
      }
      
      const newReview = {
        id: repoData.nextReviewId++,
        node_id: `PRR_${repoData.nextReviewId - 1}`,
        pull_number: parseInt(pullNumber),
        user: {
          login: 'test_user',
          id: 1000,
          node_id: 'U_kgDOTestUser',
          avatar_url: 'https://avatars.githubusercontent.com/u/1000?v=4',
          type: 'User'
        },
        body: body.body || '',
        state: body.event || 'PENDING',
        html_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}#pullrequestreview-${repoData.nextReviewId - 1}`,
        pull_request_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
        _links: {
          html: {
            href: `https://github.com/${owner}/${repo}/pull/${pullNumber}#pullrequestreview-${repoData.nextReviewId - 1}`
          },
          pull_request: {
            href: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`
          }
        },
        commit_id: body.commit_id || pull.head.sha,
        author_association: 'OWNER',
        submitted_at: body.event && body.event !== 'PENDING' ? new Date().toISOString() : undefined
      };
      
      repoData.reviews.set(newReview.id, newReview);
      this.sendResponse(res, 200, newReview);
    });
  }

  addReviewComment(req, res, match) {
    if (this.checkConfiguredError('addReviewComment', res)) return;
    
    const [, owner, repo, pullNumber, reviewId] = match;
    
    this.readBody(req, (body) => {
      const repoData = this.loadRepoData(repo);
      const pull = repoData.pulls.get(parseInt(pullNumber));
      const review = repoData.reviews.get(parseInt(reviewId));
      
      if (!pull) {
        return this.sendResponse(res, 404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/pulls/reviews#create-a-review-comment-for-a-pull-request-review'
        });
      }
      
      if (!review) {
        return this.sendResponse(res, 404, {
          message: 'Review not found',
          documentation_url: 'https://docs.github.com/rest/pulls/reviews#create-a-review-comment-for-a-pull-request-review'
        });
      }
      
      const newComment = {
        id: repoData.nextCommentId++,
        pull_number: parseInt(pullNumber),
        diff_hunk: body.diff_hunk || '',
        path: body.path || '',
        position: body.position || null,
        original_position: body.original_position || null,
        commit_id: body.commit_id || pull.head.sha,
        original_commit_id: body.original_commit_id || pull.head.sha,
        user: {
          login: 'test_user',
          id: 1000,
          type: 'User'
        },
        body: body.body || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        html_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}#discussion_r${repoData.nextCommentId - 1}`,
        pull_request_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
        pull_request_review_id: parseInt(reviewId),
        line: body.line || null,
        side: body.side || 'RIGHT',
        start_line: body.start_line || null,
        start_side: body.start_side || null,
        in_reply_to_id: body.in_reply_to_id || null
      };
      
      repoData.comments.set(newComment.id, newComment);
      this.sendResponse(res, 201, newComment);
    });
  }

  submitReview(req, res, match) {
    if (this.checkConfiguredError('submitReview', res)) return;
    
    const [, owner, repo, pullNumber, reviewId] = match;
    
    this.readBody(req, (body) => {
      const repoData = this.loadRepoData(repo);
      const pull = repoData.pulls.get(parseInt(pullNumber));
      const review = repoData.reviews.get(parseInt(reviewId));
      
      if (!pull) {
        return this.sendResponse(res, 404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/pulls/reviews#submit-a-review-for-a-pull-request'
        });
      }
      
      if (!review) {
        return this.sendResponse(res, 404, {
          message: 'Review not found',
          documentation_url: 'https://docs.github.com/rest/pulls/reviews#submit-a-review-for-a-pull-request'
        });
      }
      
      // Update review state and add submitted_at
      review.state = body.event || 'REQUEST_CHANGES';
      review.body = body.body || review.body;
      review.submitted_at = new Date().toISOString();
      
      this.sendResponse(res, 200, review);
    });
  }

  handleGraphQL(req, res, match) {
    if (this.checkConfiguredError('handleGraphQL', res)) return;
    
    this.readBody(req, (body) => {
      const { query } = body;
      
      if (!query) {
        return this.sendResponse(res, 400, {
          errors: [{
            message: 'Query is required',
            extensions: { code: 'BAD_USER_INPUT' }
          }]
        });
      }
      
      // Parse the mutation to determine action
      if (query.includes('resolveReviewThread')) {
        // Extract thread ID from mutation
        const threadIdMatch = query.match(/threadId:\s*"([^"]+)"/);
        if (!threadIdMatch) {
          return this.sendResponse(res, 400, {
            errors: [{
              message: 'threadId is required',
              extensions: { code: 'BAD_USER_INPUT' }
            }]
          });
        }
        
        const threadId = threadIdMatch[1];
        
        // Return success response for resolve
        this.sendResponse(res, 200, {
          data: {
            resolveReviewThread: {
              thread: {
                id: threadId,
                isResolved: true
              }
            }
          }
        });
      } else if (query.includes('unresolveReviewThread')) {
        // Extract thread ID from mutation
        const threadIdMatch = query.match(/threadId:\s*"([^"]+)"/);
        if (!threadIdMatch) {
          return this.sendResponse(res, 400, {
            errors: [{
              message: 'threadId is required',
              extensions: { code: 'BAD_USER_INPUT' }
            }]
          });
        }
        
        const threadId = threadIdMatch[1];
        
        // Return success response for unresolve
        this.sendResponse(res, 200, {
          data: {
            unresolveReviewThread: {
              thread: {
                id: threadId,
                isResolved: false
              }
            }
          }
        });
      } else {
        // Unknown GraphQL operation
        this.sendResponse(res, 400, {
          errors: [{
            message: 'Unknown GraphQL operation',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' }
          }]
        });
      }
    });
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

  async sendResponse(res, statusCode, data) {
    // Apply artificial latency if configured
    if (this.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.latency));
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-GitHub-Api-Version, Accept');
    res.statusCode = statusCode;
    
    if (statusCode === 204) {
      res.end();
    } else {
      res.end(JSON.stringify(data, null, 2));
    }
  }
}

// Main execution
function startServer(userDirPath = resolve(__dirname, 'test_user'), port = 3000, config = {}) {
  console.log(`Starting GitHub Mock Server...`);
  console.log(`User directory: ${userDirPath}`);
  console.log(`Port: ${port}`);
  if (Object.keys(config).length > 0) {
    console.log(`Error config:`, JSON.stringify(config, null, 2));
  }
  
  const mockServer = new GitHubMockServer(userDirPath, config);
  
  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-GitHub-Api-Version, Accept');
      res.statusCode = 204;
      res.end();
      return;
    }
    
    mockServer.handleRequest(req, res);
  });
  
  server.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`\n✓ GitHub Mock Server running on http://localhost:${actualPort}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET    /user`);
    console.log(`  GET    /user/repos`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/files`);
    console.log(`  GET    /repos/{owner}/{repo}/contents/{path}`);
    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
    console.log(`  POST   /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
    console.log(`  PATCH  /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
    console.log(`  DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
    console.log(`  POST   /graphql`);
    console.log(`\nPress Ctrl+C to stop\n`);
  });
  
  const close = (callback) => {
    server.close(callback);
  };
  
  return { server, close };
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const userDirPath = args[0] || resolve(__dirname, 'test_user');
  const port = parseInt(args[1]) || 3000;
  const { server } = startServer(userDirPath, port);
}

export { GitHubMockServer, startServer };
export default GitHubMockServer;
