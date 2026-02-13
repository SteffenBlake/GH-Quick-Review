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
 */
export function useComments() {
  return useQuery({
    queryKey: ['comments', selectedRepo.value?.full_name, selectedPr.value?.number],
    queryFn: async () => {
      if (!selectedRepo.value || !selectedPr.value) return [];
      
      return await githubClient.listPullComments(
        selectedRepo.value.full_name,
        selectedPr.value.number
      );
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
        selectedRepo.value.full_name,
        selectedPr.value.number,
        { body, commit_id: commitId, path, line, side }
      );
    },
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: ['comments', selectedRepo.value?.full_name, selectedPr.value?.number]
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
        selectedRepo.value.full_name,
        commentId,
        { body }
      );
    },
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: ['comments', selectedRepo.value?.full_name, selectedPr.value?.number]
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
      
      return await githubClient.deletePullComment(selectedRepo.value.full_name, commentId);
    },
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: ['comments', selectedRepo.value?.full_name, selectedPr.value?.number]
      });
    },
  });
}
