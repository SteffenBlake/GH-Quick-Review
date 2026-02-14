/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useMemo } from 'preact/hooks';
import { usePrData } from './prDataStore.js';
import { useDirectoryTree } from './directoryTreeStore.js';
import { useComments } from './commentsStore.js';

/**
 * Parse a diff hunk header to extract line number information
 * Format: @@ -oldStart,oldCount +newStart,newCount @@ optional context
 * @param {string} hunkHeader - The @@ line from a diff
 * @returns {Object} - { oldStart, oldCount, newStart, newCount }
 */
function parseDiffHunkHeader(hunkHeader) {
  const match = hunkHeader.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
  if (!match) {
    return { oldStart: 1, oldCount: 1, newStart: 1, newCount: 1 };
  }

  return {
    oldStart: parseInt(match[1]),
    oldCount: parseInt(match[2] || '1'),
    newStart: parseInt(match[3]),
    newCount: parseInt(match[4] || '1')
  };
}

/**
 * Parse a patch string into individual diff hunks
 * @param {string} patch - The patch text from GitHub API
 * @returns {Array} - Array of diff hunk objects
 */
function parsePatchIntoDiffs(patch) {
  if (!patch) return [];

  const lines = patch.split('\n');
  const diffs = [];
  let currentDiff = null;
  let currentNewLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start of a new hunk
    if (line.startsWith('@@')) {
      if (currentDiff) {
        diffs.push(currentDiff);
      }

      const hunkInfo = parseDiffHunkHeader(line);
      currentNewLine = hunkInfo.newStart;

      currentDiff = {
        hunkHeader: line,
        startLine: hunkInfo.newStart,
        endLine: hunkInfo.newStart, // Starts at newStart, updated as lines are processed
        lines: [line],
        ...hunkInfo
      };
    } else if (currentDiff) {
      currentDiff.lines.push(line);

      // Track line numbers in the new file
      if (line.startsWith('+')) {
        currentNewLine++;
        currentDiff.endLine = currentNewLine;
      } else if (!line.startsWith('-')) {
        // Context line (no +/-)
        currentNewLine++;
        currentDiff.endLine = currentNewLine;
      }
    }
  }

  // Push the last diff
  if (currentDiff) {
    diffs.push(currentDiff);
  }

  return diffs;
}

/**
 * Group comments by their thread ID (either explicit or by comment ID for top-level)
 * @param {Array} comments - Array of comment objects
 * @returns {Array} - Array of comment chains (arrays of comments)
 */
function groupCommentsIntoChains(comments) {
  if (!comments || comments.length === 0) return [];

  const chains = new Map();

  // First pass: group by in_reply_to_id
  comments.forEach(comment => {
    const threadId = comment.in_reply_to_id || comment.id;
    
    if (!chains.has(threadId)) {
      chains.set(threadId, []);
    }
    chains.get(threadId).push(comment);
  });

  // Convert to array and sort comments within each chain by creation time
  return Array.from(chains.values()).map(chain => 
    chain.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  );
}

/**
 * Check if a comment chain is unresolved
 * For now, we consider all chains unresolved (no resolution API data in mock)
 * In a real implementation, this would check GitHub's resolution status
 * @param {Array} chain - Array of comments in a chain
 * @returns {boolean} - True if unresolved
 */
function isChainUnresolved(chain) {
  // TODO: In real implementation, check if chain has a resolution marker
  // For now, assume all chains are unresolved
  return true;
}

/**
 * Assign a comment chain to the best matching diff based on line number
 * @param {Array} chain - Comment chain
 * @param {Array} diffs - Array of diffs for this file
 * @returns {number} - Index of the best matching diff
 */
function findBestDiffForChain(chain, diffs) {
  if (diffs.length === 0) return 0;
  if (diffs.length === 1) return 0;

  // Get the line number from the first comment in the chain
  const firstComment = chain[0];
  const targetLine = firstComment.line || firstComment.start_line || 1;

  // Find the diff that contains this line or is closest to it
  let bestDiffIndex = 0;
  let bestDistance = Infinity;

  diffs.forEach((diff, index) => {
    // Check if line is within this diff's range
    if (targetLine >= diff.startLine && targetLine <= diff.endLine) {
      bestDiffIndex = index;
      bestDistance = 0;
      return;
    }

    // Calculate distance to this diff
    const distanceToStart = Math.abs(targetLine - diff.startLine);
    const distanceToEnd = Math.abs(targetLine - diff.endLine);
    const distance = Math.min(distanceToStart, distanceToEnd);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestDiffIndex = index;
    }
  });

  return bestDiffIndex;
}

/**
 * Get files in directory browser order
 * @param {Object} tree - Directory tree from directoryTreeStore
 * @returns {Array} - Sorted array of file paths
 */
function getFilesInDirectoryOrder(tree) {
  const files = [];

  function traverse(node, path = '') {
    const entries = Object.entries(node).sort(([aName, aData], [bName, bData]) => {
      // Directories first, then files
      if (!aData.isFile && bData.isFile) return -1;
      if (aData.isFile && !bData.isFile) return 1;
      // Then alphabetically
      return aName.localeCompare(bName);
    });

    for (const [name, data] of entries) {
      const fullPath = path ? `${path}/${name}` : name;

      if (data.isFile) {
        files.push(fullPath);
      } else if (data.children) {
        traverse(data.children, fullPath);
      }
    }
  }

  traverse(tree);
  return files;
}

/**
 * Process PR data to create diffs by file with assigned comment chains
 * @param {Object} prData - PR data from prDataStore
 * @param {Object} tree - Directory tree structure
 * @param {Array} mergedComments - Merged comments from useComments (includes _isPending flag)
 * @returns {Array} - Array of file objects with diffs and comments
 */
function processDiffsByFile(prData, tree, mergedComments) {
  if (!prData || !prData.files) return [];

  const { files } = prData;
  const comments = mergedComments || [];
  
  // Get files in directory browser order
  const orderedFilePaths = getFilesInDirectoryOrder(tree);
  
  // Create a map for quick file lookup
  const fileMap = new Map(files.map(f => [f.filename, f]));
  
  // Group all comments into chains
  const allChains = groupCommentsIntoChains(comments);
  
  // Group chains by file path
  const chainsByFile = new Map();
  allChains.forEach(chain => {
    const filePath = chain[0].path;
    if (!chainsByFile.has(filePath)) {
      chainsByFile.set(filePath, []);
    }
    chainsByFile.get(filePath).push(chain);
  });

  // Process each file in directory order
  const result = orderedFilePaths.map(filePath => {
    const file = fileMap.get(filePath);
    if (!file) return null;

    // Handle deleted files specially
    if (file.status === 'removed') {
      const fileChains = chainsByFile.get(filePath) || [];
      const unresolvedChains = fileChains
        .filter(isChainUnresolved)
        .map(chain => ({
          chain,
          lineNumber: 1, // All comments on deleted files go to line 1
        }));

      return {
        filename: filePath,
        status: 'removed',
        additions: 0,
        deletions: file.deletions,
        diffs: [
          {
            // Special synthetic hunk for deleted files (not standard diff format)
            // This provides a placeholder for displaying unresolved comments
            hunkHeader: '@@ Deleted File @@',
            startLine: 1,
            endLine: 1,
            lines: ['This file was deleted'],
            unresolvedChains,
          }
        ]
      };
    }

    // Parse diffs from patch
    const diffs = parsePatchIntoDiffs(file.patch);
    
    // Get unresolved chains for this file
    const fileChains = chainsByFile.get(filePath) || [];
    const unresolvedChains = fileChains.filter(isChainUnresolved);

    // Assign each chain to the best matching diff
    const diffsWithChains = diffs.map(diff => ({
      ...diff,
      unresolvedChains: []
    }));

    unresolvedChains.forEach(chain => {
      const firstComment = chain[0];
      const lineNumber = firstComment.line || firstComment.start_line || 1;
      const bestDiffIndex = findBestDiffForChain(chain, diffs);
      
      if (diffsWithChains[bestDiffIndex]) {
        diffsWithChains[bestDiffIndex].unresolvedChains.push({
          chain,
          lineNumber,
        });
      }
    });

    return {
      filename: filePath,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      diffs: diffsWithChains
    };
  }).filter(Boolean);

  return result;
}

/**
 * Hook to get diffs organized by file with comment chains
 * This is a computed store based on PR data, directory tree, and merged comments
 */
export function useDiffsByFile() {
  const { data: prData, isLoading: prLoading, error: prError } = usePrData();
  const { tree, isLoading: treeLoading, error: treeError } = useDirectoryTree();
  const { data: mergedComments, isLoading: commentsLoading, error: commentsError } = useComments();

  const diffsByFile = useMemo(() => {
    if (!prData || !tree) return [];
    return processDiffsByFile(prData, tree, mergedComments || []);
  }, [prData, tree, mergedComments]);

  return {
    diffsByFile,
    isLoading: prLoading || treeLoading || commentsLoading,
    error: prError || treeError || commentsError
  };
}
