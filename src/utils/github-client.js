/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { getToken } from '../stores/authStore.js';

/**
 * GitHub API client for making authenticated requests
 */
class GitHubClient {
  /**
   * Get the base URL for API requests
   * Uses VITE_GITHUB_API_URL environment variable or defaults to GitHub API
   */
  getBaseUrl() {
    return import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com';
  }

  /**
   * Make a request to the GitHub API
   * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
   * @param {string} endpoint - API endpoint (e.g., '/user/repos')
   * @param {Object} body - Optional request body for POST/PATCH
   * @param {string} token - Optional token override (uses stored token if not provided)
   * @returns {Promise<any>} - Response data
   * @throws {Error} - If request fails
   */
  async request(method, endpoint, body = null, token = null) {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token provided');
    }

    const baseUrl = this.getBaseUrl();
    const url = new URL(endpoint, baseUrl);
    const options = {
      method,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${authToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };

    if (body && (method === 'POST' || method === 'PATCH')) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    // DELETE requests may not have a response body
    if (method === 'DELETE' && response.status === 204) {
      return null;
    }

    return response.json();
  }

  /**
   * Make a GET request to the GitHub API
   * @param {string} endpoint - API endpoint (e.g., '/user/repos')
   * @param {string} token - Optional token override (uses stored token if not provided)
   * @returns {Promise<any>} - Response data
   * @throws {Error} - If request fails
   */
  async get(endpoint, token = null) {
    return this.request('GET', endpoint, null, token);
  }

  /**
   * Make a POST request to the GitHub API
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {string} token - Optional token override
   * @returns {Promise<any>} - Response data
   * @throws {Error} - If request fails
   */
  async post(endpoint, body, token = null) {
    return this.request('POST', endpoint, body, token);
  }

  /**
   * Make a PATCH request to the GitHub API
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {string} token - Optional token override
   * @returns {Promise<any>} - Response data
   * @throws {Error} - If request fails
   */
  async patch(endpoint, body, token = null) {
    return this.request('PATCH', endpoint, body, token);
  }

  /**
   * Make a DELETE request to the GitHub API
   * @param {string} endpoint - API endpoint
   * @param {string} token - Optional token override
   * @returns {Promise<any>} - Response data (may be null)
   * @throws {Error} - If request fails
   */
  async delete(endpoint, token = null) {
    return this.request('DELETE', endpoint, null, token);
  }

  /**
   * List repositories for the authenticated user
   * @returns {Promise<Array>} - Array of repository objects
   */
  async listUserRepos() {
    return this.get('/user/repos');
  }

  /**
   * Get the authenticated user
   * @returns {Promise<Object>} - User object
   */
  async getUser() {
    return this.get('/user');
  }

  /**
   * Execute a GraphQL query or mutation
   * @param {string} query - GraphQL query/mutation string
   * @param {Object} variables - Variables for the query/mutation
   * @returns {Promise<Object>} - GraphQL response with data or errors
   */
  async graphql(query, variables = {}) {
    return this.post('/graphql', { query, variables });
  }

  /**
   * Resolve a review thread
   * @param {string} threadId - Thread ID to resolve
   * @returns {Promise<Object>} - GraphQL response
   */
  async resolveReviewThread(threadId) {
    const mutation = `mutation { resolveReviewThread(input: {threadId: "${threadId}"}) { thread { id isResolved } } }`;
    return this.graphql(mutation);
  }

  /**
   * Unresolve a review thread
   * @param {string} threadId - Thread ID to unresolve
   * @returns {Promise<Object>} - GraphQL response
   */
  async unresolveReviewThread(threadId) {
    const mutation = `mutation { unresolveReviewThread(input: {threadId: "${threadId}"}) { thread { id isResolved } } }`;
    return this.graphql(mutation);
  }

  /**
   * List pull requests for a repository
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @returns {Promise<Array>} - Array of pull request objects
   */
  async listPulls(repo) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    return this.get(`/repos/${repo}/pulls`);
  }

  /**
   * Get a single pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @returns {Promise<Object>} - Pull request object
   */
  async getPull(repo, pullNumber) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    return this.get(`/repos/${repo}/pulls/${pullNumber}`);
  }

  /**
   * List files changed in a pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @returns {Promise<Array>} - Array of file objects with diff information
   */
  async listPullFiles(repo, pullNumber) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    return this.get(`/repos/${repo}/pulls/${pullNumber}/files`);
  }

  /**
   * Get contents of a file from a repository
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {string} path - File path in the repository
   * @param {string} ref - Optional git reference (branch, tag, or commit SHA)
   * @returns {Promise<Object>} - File content object (base64 encoded)
   */
  async getContents(repo, path, ref = null) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!path) {
      throw new Error('File path is required');
    }
    const endpoint = ref 
      ? `/repos/${repo}/contents/${path}?ref=${ref}`
      : `/repos/${repo}/contents/${path}`;
    return this.get(endpoint);
  }

  /**
   * List review comments on a pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @returns {Promise<Array>} - Array of review comment objects
   */
  async listPullComments(repo, pullNumber) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    return this.get(`/repos/${repo}/pulls/${pullNumber}/comments`);
  }

  /**
   * Create a review comment on a pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @param {Object} comment - Comment object with body, commit_id, path, and position/line
   * @returns {Promise<Object>} - Created comment object
   */
  async createPullComment(repo, pullNumber, comment) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    return this.post(`/repos/${repo}/pulls/${pullNumber}/comments`, comment);
  }

  /**
   * Update a review comment
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} commentId - Comment ID
   * @param {Object} update - Update object with body field
   * @returns {Promise<Object>} - Updated comment object
   */
  async updatePullComment(repo, commentId, update) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!commentId) {
      throw new Error('Comment ID is required');
    }
    return this.patch(`/repos/${repo}/pulls/comments/${commentId}`, update);
  }

  /**
   * Delete a review comment
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} commentId - Comment ID
   * @returns {Promise<null>} - No content on success
   */
  async deletePullComment(repo, commentId) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!commentId) {
      throw new Error('Comment ID is required');
    }
    return this.delete(`/repos/${repo}/pulls/comments/${commentId}`);
  }

  /**
   * Reply to a review comment (creates a comment in the same thread)
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @param {number} inReplyTo - Comment ID to reply to
   * @param {string} body - Comment body
   * @returns {Promise<Object>} - Created comment object
   */
  async replyToPullComment(repo, pullNumber, inReplyTo, body) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    if (!inReplyTo) {
      throw new Error('Reply target comment ID is required');
    }
    return this.post(`/repos/${repo}/pulls/${pullNumber}/comments`, {
      body,
      in_reply_to: inReplyTo,
    });
  }

  /**
   * List reviews for a pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @returns {Promise<Array>} - Array of review objects
   */
  async listPullReviews(repo, pullNumber) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    return this.get(`/repos/${repo}/pulls/${pullNumber}/reviews`);
  }

  /**
   * Create a review for a pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @param {Object} review - Review object with optional body, event, and comments
   * @returns {Promise<Object>} - Created review object
   */
  async createPullReview(repo, pullNumber, review) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    return this.post(`/repos/${repo}/pulls/${pullNumber}/reviews`, review);
  }

  /**
   * Add a comment to an existing review using GraphQL API
   * @param {Object} params - Parameters for the comment
   * @param {string} params.pullRequestId - Pull request node ID (required for GraphQL)
   * @param {string} params.pullRequestReviewId - Review node ID (required for GraphQL)
   * @param {string} params.body - Comment body text
   * @param {string} params.path - File path
   * @param {number} params.line - Line number in the file
   * @param {string} params.side - Side of diff ('LEFT' or 'RIGHT')
   * @returns {Promise<Object>} - GraphQL response with created comment
   */
  async addPullRequestReviewThread({ pullRequestId, pullRequestReviewId, body, path, line, side = 'RIGHT' }) {
    if (!pullRequestId) {
      throw new Error('Pull request node ID is required');
    }
    if (!pullRequestReviewId) {
      throw new Error('Pull request review node ID is required');
    }
    if (!body) {
      throw new Error('Comment body is required');
    }
    if (!path) {
      throw new Error('File path is required');
    }
    if (!line) {
      throw new Error('Line number is required');
    }

    const mutation = `
      mutation($input: AddPullRequestReviewThreadInput!) {
        addPullRequestReviewThread(input: $input) {
          thread {
            id
            isResolved
            isOutdated
            comments(first: 1) {
              nodes {
                id
                body
                path
                line
                createdAt
                author {
                  login
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        pullRequestId,
        pullRequestReviewId,
        body,
        path,
        line,
        side
      }
    };

    return this.graphql(mutation, variables);
  }

  /**
   * Submit a review for a pull request
   * @param {string} repo - Full repository name (e.g., 'owner/repo')
   * @param {number} pullNumber - Pull request number
   * @param {number} reviewId - Review ID
   * @param {Object} submission - Submission object with event and optional body
   * @returns {Promise<Object>} - Submitted review object
   */
  async submitReview(repo, pullNumber, reviewId, submission) {
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!pullNumber) {
      throw new Error('Pull request number is required');
    }
    if (!reviewId) {
      throw new Error('Review ID is required');
    }
    return this.post(`/repos/${repo}/pulls/${pullNumber}/reviews/${reviewId}/events`, submission);
  }

  /**
   * Fetch reviews with comments via GraphQL
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name (not full name)
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Object>} - GraphQL response with reviews and comments
   */
  async fetchReviewsWithComments(owner, repo, prNumber) {
    if (!owner) {
      throw new Error('Repository owner is required');
    }
    if (!repo) {
      throw new Error('Repository name is required');
    }
    if (!prNumber) {
      throw new Error('Pull request number is required');
    }

    const query = `
      query($owner: String!, $repo: String!, $prNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $prNumber) {
            reviews(first: 100, states: [PENDING, COMMENTED, APPROVED, CHANGES_REQUESTED]) {
              nodes {
                id
                state
                comments(first: 100) {
                  nodes {
                    id
                    body
                    path
                    line
                    startLine
                    createdAt
                    updatedAt
                    diffHunk
                    pullRequestReview {
                      id
                      state
                    }
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      owner,
      repo,
      prNumber
    };

    return this.graphql(query, variables);
  }
}

// Export singleton instance
export const githubClient = new GitHubClient();

export default GitHubClient;
