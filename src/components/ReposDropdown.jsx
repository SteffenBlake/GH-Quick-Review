/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState } from 'preact/hooks';
import { useRepos } from '../stores/reposStore';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Repository dropdown component
 * Shows loading spinner while fetching, error on failure, repos list on success
 */
export function ReposDropdown() {
  const { data: repos, isLoading, error } = useRepos();
  const [selectedRepo, setSelectedRepo] = useState('');

  if (isLoading) {
    return (
      <div className="repos-dropdown">
        <label htmlFor="repo-select">Repository:</label>
        <div className="repos-loading">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repos-dropdown">
        <label htmlFor="repo-select">Repository:</label>
        <div className="repos-error">
          {'\uf071'} Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="repos-dropdown">
      <label htmlFor="repo-select">Repository:</label>
      <select
        id="repo-select"
        value={selectedRepo}
        onChange={(e) => setSelectedRepo(e.target.value)}
        className="repo-select"
      >
        <option value="">Select a repository...</option>
        {repos && repos.map((repo) => (
          <option key={repo.id} value={repo.full_name}>
            {repo.full_name}
          </option>
        ))}
      </select>
    </div>
  );
}
