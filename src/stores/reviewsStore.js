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
      
      // Fetch all reviews for the PR with cache-busting
      // CRITICAL: Always use cache-busting to avoid getting stale PENDING state
      // from browser cache or GitHub's eventual consistency window (750ms)
      const reviews = await githubClient.listPullReviews(
        selectedRepo.value,
        selectedPr.value,
        { bustCache: true } // ALWAYS bust cache to get fresh review state
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
    mutationFn: async ({ commitId, body = '', event }) => {
      if (!selectedRepo.value || !selectedPr.value) {
        throw new Error('No PR selected');
      }
      
      // Build request body - omit event field to create PENDING review
      const requestBody = { commit_id: commitId, body };
      if (event) {
        requestBody.event = event;
      }
      
      return await githubClient.createPullReview(
        selectedRepo.value,
        selectedPr.value,
        requestBody
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
    mutationFn: async ({ reviewNodeId, body, path, line, side }) => {
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
 * Hook to submit a review with polling for eventual consistency
 * 
 * GitHub's API is eventually consistent. After submitting a review,
 * the review state may still appear as "PENDING" in listReviews for
 * several hundred milliseconds. This hook polls until the review
 * state is updated to prevent UI issues where the submit button
 * remains visible after submission.
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  
  return useMutation({
    mutationFn: async ({ reviewId, body, event }) => {
      console.log('[MUTATION] START:', { reviewId, event });
      
      if (!selectedRepo.value || !selectedPr.value) {
        console.error('[MUTATION] ERROR: No PR selected');
        throw new Error('No PR selected');
      }
      
      console.log('[MUTATION] Calling submitReview API...');
      // Submit the review
      const submittedReview = await githubClient.submitReview(
        selectedRepo.value,
        selectedPr.value,
        reviewId,
        { body, event }
      );
      console.log('[MUTATION] submitReview returned:', submittedReview);
      
      // Poll for eventual consistency:
      // GitHub API may return cached/stale "PENDING" state briefly after submission
      // Poll with cache-busting until state updates or timeout
      const pollTimeout = 5000; // 5 second timeout
      const pollInterval = 2000; // Poll every 2 seconds to avoid rate limiting
      
      console.log('[MUTATION] Waiting 1s before polling...');
      // Wait 1s before first poll to allow for eventual consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[MUTATION] Starting polling loop...');
      // Start timeout measurement AFTER initial wait
      const pollStartTime = Date.now();
      
      while (Date.now() - pollStartTime < pollTimeout) {
        console.log(`[MUTATION] Poll attempt (elapsed: ${Date.now() - pollStartTime}ms)`);
        console.log(`[MUTATION] selectedRepo=${selectedRepo.value}, selectedPr=${selectedPr.value}`);
        
        // Fetch current reviews with cache-busting to prevent browser cache issues
        // Real GitHub API sends Cache-Control headers that cause browsers to cache for 60s
        let reviews;
        try {
          reviews = await githubClient.listPullReviews(
            selectedRepo.value,
            selectedPr.value,
            { bustCache: true }
          );
          console.log(`[MUTATION] listPullReviews SUCCESS: ${reviews.length} reviews`);
        } catch (err) {
          console.error(`[MUTATION] listPullReviews ERROR:`, {
            message: err?.message,
            name: err?.name,
            stack: err?.stack,
            toString: String(err),
            err
          });
          throw err; // Re-throw to maintain original behavior
        }
        
        console.log(`[POLLING] Fetched ${reviews.length} reviews. Looking for ID ${reviewId}`);
        
        // Check if the review is no longer PENDING
        const review = reviews.find(r => r.id === reviewId);
        
        if (review) {
          console.log(`[POLLING] Found review ${reviewId} with state: ${review.state}`);
        } else {
          console.log(`[POLLING] Review ${reviewId} NOT FOUND in response!`);
        }
        
        if (!review || review.state !== 'PENDING') {
          // Review state has been updated - success!
          console.log(`[POLLING] SUCCESS - Review is no longer PENDING`);
          return submittedReview;
        }
        
        console.log(`[POLLING] Review still PENDING, waiting ${pollInterval}ms before next poll`);
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
      
      // Timeout reached - throw error with detailed debug info
      const debugInfo = {
        reviewId,
        pollTimeout,
        pollInterval,
        totalTime: Date.now() - pollStartTime,
        message: 'GitHub API did not respond with updated review state within timeout'
      };
      console.error('[POLLING] TIMEOUT!', debugInfo);
      throw new Error(`Polling timeout: ${JSON.stringify(debugInfo)}`);
    },
     onSuccess: () => {
      // Reset ALL queries to force fresh data
      queryClient.resetQueries({
        queryKey: ['activeReview'],
        exact: false
      });
      queryClient.resetQueries({
        queryKey: ['comments'],
        exact: false
      });
      queryClient.resetQueries({
        queryKey: ['reviews'],
        exact: false
      });
    },
  });
}
