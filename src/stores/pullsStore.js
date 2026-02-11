/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useQuery } from '@tanstack/react-query';
import { token } from './authStore.js';
import { selectedRepo } from './selectedRepoStore.js';
import { setError, clearError } from './errorStore.js';
import { githubClient } from '../utils/github-client.js';

/**
 * React Query hook for pulls - professional async state management
 * Automatically handles loading/error/success states
 * Automatically refetches when enabled changes (token present and repo selected)
 */
export function usePulls() {
  const query = useQuery({
    queryKey: ['pulls', selectedRepo.value],
    queryFn: async () => {
      try {
        const data = await githubClient.listPulls(selectedRepo.value);
        clearError(); // Clear error on success
        return data;
      } catch (error) {
        setError(error.message || 'Failed to load pull requests');
        throw error;
      }
    },
    enabled: !!token.value && !!selectedRepo.value, // Only run query when token exists and repo is selected
    retry: false, // Don't retry on error
  });

  return query;
}
