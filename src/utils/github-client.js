/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { getToken } from './auth';

/**
 * GitHub API client for making authenticated requests
 */
class GitHubClient {
  constructor(baseUrl = 'https://api.github.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request to the GitHub API
   * @param {string} endpoint - API endpoint (e.g., '/user')
   * @param {string} token - Optional token override (uses stored token if not provided)
   * @returns {Promise<any>} - Response data
   * @throws {Error} - If request fails
   */
  async get(endpoint, token = null) {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token provided');
    }

    const url = `${this.baseUrl}${endpoint}`;
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
   * Verify a GitHub token by fetching the authenticated user
   * @param {string} token - Token to verify
   * @returns {Promise<object>} - User object if token is valid
   * @throws {Error} - If token is invalid
   */
  async verifyToken(token) {
    return this.get('/user', token);
  }

  /**
   * Get the authenticated user
   * @returns {Promise<object>} - User object
   */
  async getUser() {
    return this.get('/user');
  }
}

// Export singleton instance
export const githubClient = new GitHubClient(
  // Use environment variable for base URL, useful for testing with mock server
  typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_GITHUB_API_URL : undefined
);

export default GitHubClient;
