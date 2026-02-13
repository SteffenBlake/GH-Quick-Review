/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useQuery } from '@tanstack/react-query';
import { token } from './authStore.js';
import { selectedRepo } from './selectedRepoStore.js';
import { selectedPr } from './selectedPrStore.js';
import { setError, clearError } from './errorStore.js';
import { githubClient } from '../utils/github-client.js';

/**
 * React Query hook for fetching complete PR data
 * Fetches PR details, files, and comments in parallel
 * Automatically refetches when PR selection changes
 */
export function usePrData() {
  const query = useQuery({
    queryKey: ['prData', selectedRepo.value, selectedPr.value],
    queryFn: async () => {
      try {
        const repo = selectedRepo.value;
        const prNumber = parseInt(selectedPr.value);

        if (!repo || !prNumber) {
          return null;
        }

        // Fetch all PR data in parallel
        const [pullDetails, files, comments, reviews] = await Promise.all([
          githubClient.getPull(repo, prNumber),
          githubClient.listPullFiles(repo, prNumber),
          githubClient.listPullComments(repo, prNumber),
          githubClient.listPullReviews(repo, prNumber)
        ]);

        clearError();
        
        // Find existing pending review for current user
        const currentUser = await githubClient.getUser();
        const existingReview = reviews.find(
          review => review.state === 'PENDING' && review.user.login === currentUser.login
        );
        
        // Return raw data object
        return {
          pull: pullDetails,
          files,
          comments,
          reviews,
          existingReview
        };
      } catch (error) {
        setError(error.message || 'Failed to load PR data');
        throw error;
      }
    },
    enabled: !!token.value && !!selectedRepo.value && !!selectedPr.value,
    retry: false,
    // Keep data fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return query;
}
