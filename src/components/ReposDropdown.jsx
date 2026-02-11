/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRepos } from '../stores/reposStore';
import { selectedRepo, setSelectedRepo } from '../stores/selectedRepoStore';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Repository dropdown component
 * Shows loading spinner while fetching, error on failure, repos list on success
 */
export function ReposDropdown() {
  const { data: repos, isLoading, error } = useRepos();

  if (isLoading) {
    return (
      <div className="repos-dropdown">
        <div className="repos-loading">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repos-dropdown">
        <div className="repos-error">
          {'\uf071'} Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="repos-dropdown">
      <select
        id="repo-select"
        value={selectedRepo.value}
        onChange={(e) => setSelectedRepo(e.target.value)}
        className="repo-select"
      >
        <option value="">Repo...</option>
        {repos && repos.map((repo) => {
          // Strip username/ from display
          const repoName = repo.full_name.split('/')[1] || repo.full_name;
          return (
            <option key={repo.id} value={repo.full_name}>
              {repoName}
            </option>
          );
        })}
      </select>
    </div>
  );
}
