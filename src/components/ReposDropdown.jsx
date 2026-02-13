/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRepos } from '../stores/reposStore';
import { selectedRepo, setSelectedRepo } from '../stores/selectedRepoStore';
import { FuzzyDropdown } from './FuzzyDropdown';

/**
 * Repository dropdown component with fuzzy search
 * Shows loading spinner inside dropdown while fetching, error on failure, repos list on success
 */
export function ReposDropdown() {
  const { data: repos, isLoading, error } = useRepos();

  // Convert repos to dropdown options format
  const options = repos ? repos.map((repo) => {
    const repoName = repo.full_name.split('/')[1] || repo.full_name;
    return {
      value: repo.full_name,
      label: repoName,
      searchableText: `${repoName} ${repo.full_name}`,
    };
  }) : [];

  return (
    <div className="repos-dropdown">
      <FuzzyDropdown
        id="repo-select"
        value={selectedRepo.value}
        onChange={setSelectedRepo}
        options={options}
        placeholder="Repo..."
        isLoading={isLoading}
        error={error}
        className="repo-fuzzy-select"
      />
    </div>
  );
}
