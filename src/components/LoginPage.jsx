/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState } from 'preact/hooks';
import { setToken } from '../utils/auth';
import { githubClient } from '../utils/github-client';
import { LoadingSpinner } from './LoadingSpinner';

export function LoginPage({ onLogin }) {
  const [token, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save token first
      setToken(token.trim());
      
      // Validate token by fetching user repos
      await githubClient.listUserRepos();
      
      // Token is valid, trigger login
      onLogin();
    } catch (err) {
      // Token validation failed, clear it
      setToken('');
      setError(
        err.status === 401
          ? 'Invalid token. Please check your GitHub Personal Access Token.'
          : 'Failed to connect to GitHub. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>
          {'\udb80\udf06'} Login Required
        </h2>
        <p>Please enter your GitHub Personal Access Token to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your GitHub PAT"
            value={token}
            onInput={(e) => setTokenInput(e.target.value)}
            className="pat-input"
            autoFocus
            disabled={loading}
          />
          {error && (
            <div className="error-message">
              {'\uf071'} {error}
            </div>
          )}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <LoadingSpinner text="Verifying token..." />
            ) : (
              <>{'\udb80\udf42'} Login</>
            )}
          </button>
        </form>
        <div className="login-links">
          <a
            href="https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Generating-a-PAT-Token.md"
            target="_blank"
            rel="noopener noreferrer"
            className="login-link"
          >
            {'\ueaa4'} Guide: How to generate a PAT token
          </a>
          <a
            href="https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Should-You-Trust-This-App.md"
            target="_blank"
            rel="noopener noreferrer"
            className="login-link"
          >
            {'\uf071'} Warning: Should you trust this app?
          </a>
        </div>
      </div>
    </div>
  );
}
