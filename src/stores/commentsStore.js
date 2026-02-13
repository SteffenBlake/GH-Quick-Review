/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { selectedRepo } from './selectedRepoStore';
import { selectedPr } from './selectedPrStore';
import { githubClient } from '../utils/github-client';

/**
 * Hook to fetch all comments for the currently selected PR
 * Merges comments from REST API (submitted comments) and GraphQL (pending review comments)
 */
export function useComments() {
  return useQuery({
    queryKey: ['comments', selectedRepo.value, selectedPr.value],
    queryFn: async () => {
      if (!selectedRepo.value || !selectedPr.value) return [];
      
      // Fetch submitted comments from REST API
      const restComments = await githubClient.listPullComments(
        selectedRepo.value,
        selectedPr.value
      );
      
      // Fetch reviews with comments from GraphQL (including PENDING reviews)
      // Parse owner/repo from full repo name
      const [owner, repo] = selectedRepo.value.split('/');
      let graphqlComments = [];
      
      try {
        const graphqlResponse = await githubClient.fetchReviewsWithComments(
          owner,
          repo,
          selectedPr.value
        );
        
        // Extract comments from GraphQL response
        if (graphqlResponse?.data?.repository?.pullRequest?.reviews?.nodes) {
          const reviews = graphqlResponse.data.repository.pullRequest.reviews.nodes;
          
          // Flatten all comments from all reviews
          graphqlComments = reviews.flatMap(review => 
            (review.comments?.nodes || []).map(comment => ({
              // Transform GraphQL comment to REST API format
              id: parseInt(comment.id.replace('PRRC_', '')), // Extract numeric ID
              pull_number: selectedPr.value,
              diff_hunk: comment.diffHunk || '',
              path: comment.path || '',
              position: null,
              original_position: null,
              commit_id: null, // Not available in GraphQL response
              original_commit_id: null,
              user: {
                login: comment.author?.login || 'unknown',
                id: 0,
                type: 'User'
              },
              body: comment.body || '',
              created_at: comment.createdAt,
              updated_at: comment.updatedAt,
              html_url: '',
              pull_request_url: '',
              line: comment.line,
              side: 'RIGHT',
              start_line: comment.startLine,
              start_side: comment.startLine ? 'RIGHT' : null,
              in_reply_to_id: null,
              _isPending: review.state === 'PENDING', // Add flag for pending comments
              _reviewState: review.state // Store review state for debugging
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch GraphQL comments:', error);
        // Continue with REST comments only if GraphQL fails
      }
      
      // Merge and deduplicate comments
      // Create a map by comment ID to avoid duplicates
      const commentsMap = new Map();
      
      // Add REST comments first (they are the source of truth for submitted comments)
      restComments.forEach(comment => {
        commentsMap.set(comment.id, comment);
      });
      
      // Add GraphQL comments only if they don't already exist
      // This handles the case where a comment transitions from PENDING to submitted
      graphqlComments.forEach(comment => {
        if (!commentsMap.has(comment.id)) {
          commentsMap.set(comment.id, comment);
        }
      });
      
      // Convert map back to array
      return Array.from(commentsMap.values());
    },
    enabled: !!selectedRepo.value && !!selectedPr.value,
  });
}

/**
 * Hook to create a new comment on a PR
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ body, commitId, path, line, side }) => {
      if (!selectedRepo.value || !selectedPr.value) {
        throw new Error('No PR selected');
      }
      
      return await githubClient.createPullComment(
        selectedRepo.value,
        selectedPr.value,
        { body, commit_id: commitId, path, line, side }
      );
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
 * Hook to update an existing comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, body }) => {
      if (!selectedRepo.value) {
        throw new Error('No repo selected');
      }
      
      return await githubClient.updatePullComment(
        selectedRepo.value,
        commentId,
        { body }
      );
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
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId }) => {
      if (!selectedRepo.value) {
        throw new Error('No repo selected');
      }
      
      return await githubClient.deletePullComment(selectedRepo.value, commentId);
    },
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: ['comments', selectedRepo.value, selectedPr.value]
      });
    },
  });
}
