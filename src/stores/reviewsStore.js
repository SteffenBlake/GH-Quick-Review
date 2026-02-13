/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { selectedRepo } from './selectedRepoStore';
import { selectedPr } from './selectedPrStore';
import { githubClient } from '../utils/github-client';
import { useCurrentUser } from './userStore';
import { usePrData } from './prDataStore';

/**
 * Hook to fetch the active (pending) review for the current user on the selected PR
 */
export function useActiveReview() {
  const { data: currentUser } = useCurrentUser();
  
  return useQuery({
    queryKey: ['activeReview', selectedRepo.value, selectedPr.value, currentUser?.login],
    queryFn: async () => {
      if (!selectedRepo.value || !selectedPr.value || !currentUser?.login) return null;
      
      // Fetch all reviews for the PR
      const reviews = await githubClient.listPullReviews(
        selectedRepo.value,
        selectedPr.value
      );
      
      // Find a PENDING review by the current user
      const activeReview = reviews.find(
        review => review.user.login === currentUser.login && review.state === 'PENDING'
      );
      
      return activeReview || null;
    },
    enabled: !!selectedRepo.value && !!selectedPr.value && !!currentUser?.login,
  });
}

/**
 * Hook to create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  
  return useMutation({
    mutationFn: async ({ commitId, body = '', event = 'PENDING' }) => {
      if (!selectedRepo.value || !selectedPr.value) {
        throw new Error('No PR selected');
      }
      
      return await githubClient.createPullReview(
        selectedRepo.value,
        selectedPr.value,
        { commit_id: commitId, body, event }
      );
    },
    onSuccess: () => {
      // Invalidate active review query to refetch
      queryClient.invalidateQueries({
        queryKey: ['activeReview', selectedRepo.value, selectedPr.value, currentUser?.login]
      });
    },
  });
}

/**
 * Hook to add a comment to an existing review using GraphQL
 */
export function useAddReviewComment() {
  const queryClient = useQueryClient();
  const { data: prData } = usePrData();
  
  return useMutation({
    mutationFn: async ({ reviewId, reviewNodeId, body, commitId, path, line, side }) => {
      if (!selectedRepo.value || !selectedPr.value) {
        throw new Error('No PR selected');
      }
      
      // Get the PR node_id from prData
      if (!prData?.pull?.node_id) {
        throw new Error('Pull request node_id not available');
      }
      
      if (!reviewNodeId) {
        throw new Error('Review node_id is required for GraphQL mutation');
      }
      
      return await githubClient.addPullRequestReviewThread({
        pullRequestId: prData.pull.node_id,
        pullRequestReviewId: reviewNodeId,
        body,
        path,
        line,
        side: side || 'RIGHT'
      });
    },
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: ['comments', selectedRepo.value, selectedPr.value]
      });
    },
  });
}

/**
 * Hook to submit a review
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  
  return useMutation({
    mutationFn: async ({ reviewId, body, event }) => {
      if (!selectedRepo.value || !selectedPr.value) {
        throw new Error('No PR selected');
      }
      
      return await githubClient.submitReview(
        selectedRepo.value,
        selectedPr.value,
        reviewId,
        { body, event }
      );
    },
    onSuccess: () => {
      // Invalidate active review and comments queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['activeReview', selectedRepo.value, selectedPr.value, currentUser?.login]
      });
      queryClient.invalidateQueries({
        queryKey: ['comments', selectedRepo.value, selectedPr.value]
      });
    },
  });
}
