/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { usePulls } from '../stores/pullsStore';
import { selectedPr, setSelectedPr } from '../stores/selectedPrStore';
import { selectedRepo } from '../stores/selectedRepoStore';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Pull requests dropdown component
 * Shows loading spinner while fetching, error on failure, PRs list on success
 */
export function PullsDropdown() {
  const { data: pulls, isLoading, error } = usePulls();

  if (isLoading) {
    return (
      <div className="pulls-dropdown">
        <div className="pulls-loading">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pulls-dropdown">
        <div className="pulls-error">
          {'\uf071'} Error: {error.message}
        </div>
      </div>
    );
  }

  // Disable dropdown when no repo is selected
  const isDisabled = !selectedRepo.value;

  return (
    <div className="pulls-dropdown">
      <select
        id="pr-select"
        value={selectedPr.value}
        onChange={(e) => setSelectedPr(e.target.value)}
        className="pr-select"
        disabled={isDisabled}
      >
        <option value="">Pull Request...</option>
        {pulls && pulls.map((pr) => {
          // Format: "#{number} - {title}"
          const displayText = `#${pr.number} - ${pr.title}`;
          return (
            <option key={pr.id} value={pr.number}>
              {displayText}
            </option>
          );
        })}
      </select>
    </div>
  );
}
