/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useQuery } from '@tanstack/react-query';
import { token } from './authStore.js';
import { setError, clearError } from './errorStore.js';
import { githubClient } from '../utils/github-client.js';

/**
 * React Query hook for repos - professional async state management
 * Automatically handles loading/error/success states
 * Automatically refetches when enabled changes (token present)
 */
export function useRepos() {
  const query = useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      try {
        const data = await githubClient.listUserRepos();
        clearError(); // Clear error on success
        return data;
      } catch (error) {
        setError(error.message || 'Failed to load repositories');
        throw error;
      }
    },
    enabled: !!token.value, // Only run query when token exists
    retry: false, // Don't retry on error
  });

  return query;
}
