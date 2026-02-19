/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useMemo } from 'preact/hooks';
import { usePrData } from './prDataStore.js';
import { useComments } from './commentsStore.js';

/**
 * Build a nested directory tree from file changes
 * @param {Array} files - Array of file objects from PR
 * @param {Array} comments - Array of comment objects from PR
 * @returns {Object} - Nested tree structure
 */
function buildDirectoryTree(files, comments) {
  if (!files || files.length === 0) {
    return {};
  }

  const tree = {};

  // Count comments per file
  const commentCounts = {};
  // Count unresolved threads per file
  const unresolvedThreadCounts = {};
  
  if (comments) {
    // First, count total comments per file
    comments.forEach(comment => {
      const path = comment.path || '';
      commentCounts[path] = (commentCounts[path] || 0) + 1;
    });
    
    // Then, count unresolved threads per file
    // Group by threadId and file path
    const threadsByFile = new Map();
    comments.forEach(comment => {
      const path = comment.path || '';
      const threadId = comment._threadId || comment.id;
      
      if (!threadsByFile.has(path)) {
        threadsByFile.set(path, new Map());
      }
      
      const fileThreads = threadsByFile.get(path);
      if (!fileThreads.has(threadId)) {
        // Store first comment of thread to get _isResolved flag
        fileThreads.set(threadId, comment);
      }
    });
    
    // Count unresolved threads per file
    threadsByFile.forEach((threads, path) => {
      let unresolvedCount = 0;
      threads.forEach(comment => {
        // Thread is unresolved if _isResolved is not explicitly true
        if (comment._isResolved !== true) {
          unresolvedCount++;
        }
      });
      unresolvedThreadCounts[path] = unresolvedCount;
    });
  }

  // Build tree from files
  files.forEach(file => {
    const parts = file.filename.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          isFile,
          children: isFile ? null : {},
          commentCount: 0,
          unresolvedThreadCount: 0,
          status: isFile ? file.status : null,
          additions: isFile ? file.additions : 0,
          deletions: isFile ? file.deletions : 0,
          changes: isFile ? file.changes : 0
        };
      }

      // Add comment count and unresolved thread count to file
      if (isFile) {
        current[part].commentCount = commentCounts[file.filename] || 0;
        current[part].unresolvedThreadCount = unresolvedThreadCounts[file.filename] || 0;
      }

      if (!isFile) {
        current = current[part].children;
      }
    });
  });

  // Bubble up comment counts and unresolved thread counts to parent directories
  function bubbleUpCounts(node) {
    if (!node.children) {
      return {
        comments: node.commentCount || 0,
        unresolvedThreads: node.unresolvedThreadCount || 0
      };
    }

    let totalComments = 0;
    let totalUnresolvedThreads = 0;
    let totalAdditions = 0;
    let totalDeletions = 0;
    let totalChanges = 0;

    Object.values(node.children).forEach(child => {
      const childCounts = bubbleUpCounts(child);
      totalComments += childCounts.comments;
      totalUnresolvedThreads += childCounts.unresolvedThreads;
      totalAdditions += child.additions || 0;
      totalDeletions += child.deletions || 0;
      totalChanges += child.changes || 0;
    });

    node.commentCount = totalComments;
    node.unresolvedThreadCount = totalUnresolvedThreads;
    node.additions = totalAdditions;
    node.deletions = totalDeletions;
    node.changes = totalChanges;

    return {
      comments: totalComments,
      unresolvedThreads: totalUnresolvedThreads
    };
  }

  // Apply bubble up to all top-level nodes
  Object.values(tree).forEach(node => {
    bubbleUpCounts(node);
  });

  return tree;
}

/**
 * Hook to get the directory tree structure
 * Derived from PR data and comments
 */
export function useDirectoryTree() {
  const { data: prData, isLoading: prLoading, error: prError } = usePrData();
  const { data: comments, isLoading: commentsLoading, error: commentsError } = useComments();

  const tree = useMemo(() => {
    if (!prData || !prData.files) {
      return {};
    }
    return buildDirectoryTree(prData.files, comments || []);
  }, [prData, comments]);

  return {
    tree,
    isLoading: prLoading || commentsLoading,
    error: prError || commentsError
  };
}
