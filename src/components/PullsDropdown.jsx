/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { usePulls } from '../stores/pullsStore';
import { selectedPr, setSelectedPr } from '../stores/selectedPrStore';
import { selectedRepo } from '../stores/selectedRepoStore';
import { FuzzyDropdown } from './FuzzyDropdown';

/**
 * Pull requests dropdown component with fuzzy search
 * Shows loading spinner inside dropdown while fetching, error on failure, PRs list on success
 */
export function PullsDropdown() {
  const { data: pulls, isLoading, error } = usePulls();

  // Disable dropdown when no repo is selected
  const isDisabled = !selectedRepo.value;

  // Convert pulls to dropdown options format
  const options = pulls ? pulls.map((pr) => {
    const displayText = `#${pr.number} - ${pr.title}`;
    return {
      value: pr.number,
      label: displayText,
      searchableText: `#${pr.number} ${pr.title}`,
    };
  }) : [];

  return (
    <div className="pulls-dropdown">
      <FuzzyDropdown
        value={selectedPr.value}
        onChange={setSelectedPr}
        options={options}
        placeholder="Pull Request..."
        isLoading={isLoading}
        error={error}
        disabled={isDisabled}
        className="pr-fuzzy-select"
      />
    </div>
  );
}
