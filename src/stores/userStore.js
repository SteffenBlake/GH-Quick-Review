/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useQuery } from '@tanstack/react-query';
import { token } from './authStore';
import { githubClient } from '../utils/github-client';

/**
 * Hook to fetch the authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => githubClient.getUser(),
    enabled: !!token.value,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
