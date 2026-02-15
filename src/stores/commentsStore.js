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
 * Uses GraphQL reviewThreads to get all comment threads (submitted and pending)
 * Filters to show:
 * - Unresolved threads (isResolved === false)
 * - Threads with PENDING comments (pullRequestReview.state === 'PENDING')
 */
export function useComments() {
  return useQuery({
    queryKey: ['comments', selectedRepo.value, selectedPr.value],
    queryFn: async () => {
      if (!selectedRepo.value || !selectedPr.value) return [];
      
      // Parse owner/repo from full repo name
      const [owner, repo] = selectedRepo.value.split('/');
      
      try {
        const graphqlResponse = await githubClient.fetchReviewThreads(
          owner,
          repo,
          selectedPr.value
        );
        
        // Extract review threads from GraphQL response
        if (!graphqlResponse?.data?.repository?.pullRequest?.reviewThreads?.nodes) {
          return [];
        }
        
        const threads = graphqlResponse.data.repository.pullRequest.reviewThreads.nodes;
        
        // Flatten all comments from all threads
        // Filter threads to show:
        // 1. Unresolved threads (isResolved === false)
        // 2. Threads with any PENDING comment
        const allComments = [];
        
        for (const thread of threads) {
          const comments = thread.comments?.nodes || [];
          if (comments.length === 0) continue;
          
          // Check if thread should be visible
          const hasPendingComment = comments.some(
            comment => comment.pullRequestReview?.state === 'PENDING'
          );
          const isUnresolved = thread.isResolved === false;
          
          // Show thread if it's unresolved OR has pending comments
          if (isUnresolved || hasPendingComment) {
            // Transform comments to flat structure for compatibility
            const transformedComments = comments.map(comment => ({
              // Use databaseId if available, otherwise extract from node id
              id: comment.databaseId || parseInt(comment.id.replace(/^PRRC_/, '')) || 0,
              pull_number: selectedPr.value,
              diff_hunk: comment.diffHunk || '',
              path: comment.path || '',
              position: null,
              original_position: null,
              commit_id: null,
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
              // Add thread and review metadata
              _threadId: thread.id,
              _isResolved: thread.isResolved,
              _isOutdated: thread.isOutdated,
              _isPending: comment.pullRequestReview?.state === 'PENDING',
              _reviewState: comment.pullRequestReview?.state
            }));
            
            allComments.push(...transformedComments);
          }
        }
        
        return allComments;
      } catch (error) {
        console.error('Failed to fetch review threads:', error);
        return [];
      }
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
