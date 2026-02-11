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
   * Make a GET request to the GitHub API
   * @param {string} endpoint - API endpoint (e.g., '/user/repos')
   * @param {string} token - Optional token override (uses stored token if not provided)
   * @returns {Promise<any>} - Response data
   * @throws {Error} - If request fails
   */
  async get(endpoint, token = null) {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token provided');
    }

    const baseUrl = this.getBaseUrl();
    const url = new URL(endpoint, baseUrl);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${authToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error = new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response.json();
  }

  /**
   * List repositories for the authenticated user
   * @returns {Promise<Array>} - Array of repository objects
   */
  async listUserRepos() {
    return this.get('/user/repos');
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
}

// Export singleton instance
export const githubClient = new GitHubClient();

export default GitHubClient;
