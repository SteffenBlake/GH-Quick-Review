/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';
import { setSelectedFile } from './selectedFileStore.js';
import { setIsUserScrolling } from './scrollSyncStore.js';

// Currently selected comment chain (null when no chain is selected)
export const selectedCommentChain = signal(null);

// Selected file and line for new comment
export const selectedCommentLocation = signal(null);

// Ref to the modal element for direct focus control
let modalRef = null;

// Store reference to diffsByFile for navigation
// This will be set by DiffViewer when it renders
export const diffsByFile = signal([]);

/**
 * Register the modal ref so we can focus it directly
 * @param {Object} ref - The modal element ref
 */
export function registerModalRef(ref) {
  modalRef = ref;
}

/**
 * Show the comment modal with a specific comment chain
 * @param {Object} commentChain - Object with {filename, lineNumber}
 */
export function showCommentModal(commentChain) {
  selectedCommentChain.value = {
    filename: commentChain.filename,
    lineNumber: commentChain.lineNumber
  };
  selectedCommentLocation.value = null;

  // Directly focus the modal
  if (modalRef && modalRef.current) {
    modalRef.current.focus();
  }
}

/**
 * Show the comment modal for creating a new comment at a specific location
 * @param {string} filename - The file path
 * @param {number} lineNumber - The line number
 */
export function showNewCommentModal(filename, lineNumber) {
  selectedCommentLocation.value = { filename, lineNumber };
  selectedCommentChain.value = null;

  // Directly focus the modal
  if (modalRef && modalRef.current) {
    modalRef.current.focus();
  }
}

/**
 * Clear the comment modal state
 */
export function clearCommentModal() {
  selectedCommentChain.value = null;
  selectedCommentLocation.value = null;
}

/**
 * Get all review threads in order (by file directory order, then line number)
 * @returns {Array} Array of {filename, lineNumber} objects representing all review threads
 */
export function getAllReviewThreadsInOrder() {
  const threads = [];

  // Iterate through all files in directory order
  for (const file of diffsByFile.value) {
    // Iterate through all diffs in this file
    for (const diff of file.diffs) {
      // Get all unresolved chains in this diff
      for (const { lineNumber } of diff.unresolvedChains) {
        threads.push({
          filename: file.filename,
          lineNumber
        });
      }
    }
  }

  return threads;
}

/**
 * Get the index of the current review thread in the ordered list
 * @returns {number} Index of current thread, or -1 if not found
 */
export function getCurrentThreadIndex() {
  if (!selectedCommentChain.value) {
    return -1;
  }

  const threads = getAllReviewThreadsInOrder();
  const { filename, lineNumber } = selectedCommentChain.value;

  return threads.findIndex(
    thread => thread.filename === filename && thread.lineNumber === lineNumber
  );
}

/**
 * Check if there is a next thread on a DIFFERENT line than the current one
 * @returns {boolean} True if there is a navigable next thread
 */
export function hasNextThread() {
  const currentIndex = getCurrentThreadIndex();
  if (currentIndex < 0) {return false;}

  const threads = getAllReviewThreadsInOrder();
  const currentThread = threads[currentIndex];
  if (!currentThread) {return false;}

  const currentLine = currentThread.lineNumber;
  const currentFilename = currentThread.filename;

  // Check if there's any thread after current that's on a different line
  for (let i = currentIndex + 1; i < threads.length; i++) {
    const thread = threads[i];
    if (thread.filename !== currentFilename || thread.lineNumber !== currentLine) {
      return true;
    }
  }
  return false;
}

/**
 * Check if there is a previous thread on a DIFFERENT line than the current one
 * @returns {boolean} True if there is a navigable previous thread
 */
export function hasPreviousThread() {
  const currentIndex = getCurrentThreadIndex();
  if (currentIndex <= 0) {return false;}

  const threads = getAllReviewThreadsInOrder();
  const currentThread = threads[currentIndex];
  if (!currentThread) {return false;}

  const currentLine = currentThread.lineNumber;
  const currentFilename = currentThread.filename;

  // Check if there's any thread before current that's on a different line
  for (let i = currentIndex - 1; i >= 0; i--) {
    const thread = threads[i];
    if (thread.filename !== currentFilename || thread.lineNumber !== currentLine) {
      return true;
    }
  }
  return false;
}

/**
 * Navigate to the previous review thread
 * Skips to the previous thread on a DIFFERENT line than the current one
 */
export function navigateToPreviousThread() {
  const currentIndex = getCurrentThreadIndex();
  if (currentIndex <= 0) {
    return; // Already at first thread or not in a thread
  }

  const threads = getAllReviewThreadsInOrder();
  const currentThread = threads[currentIndex];
  const currentLine = currentThread.lineNumber;
  const currentFilename = currentThread.filename;

  // Find the previous thread on a DIFFERENT line
  let previousThread = null;
  for (let i = currentIndex - 1; i >= 0; i--) {
    const thread = threads[i];
    // Skip threads on the same file and line as current thread
    if (thread.filename !== currentFilename || thread.lineNumber !== currentLine) {
      previousThread = thread;
      break;
    }
  }

  if (previousThread) {
    selectedCommentChain.value = {
      filename: previousThread.filename,
      lineNumber: previousThread.lineNumber
    };
    selectedCommentLocation.value = null;

    // Scroll to the thread location
    scrollToThread(previousThread.filename, previousThread.lineNumber);

    // Focus the modal
    if (modalRef && modalRef.current) {
      modalRef.current.focus();
    }
  }
}

/**
 * Navigate to the next review thread
 * Skips to the next thread on a DIFFERENT line than the current one
 */
export function navigateToNextThread() {
  const currentIndex = getCurrentThreadIndex();
  const threads = getAllReviewThreadsInOrder();

  if (currentIndex < 0 || currentIndex >= threads.length - 1) {
    return; // Not in a thread or already at last thread
  }

  const currentThread = threads[currentIndex];
  const currentLine = currentThread.lineNumber;
  const currentFilename = currentThread.filename;

  // Find the next thread on a DIFFERENT line
  let nextThread = null;
  for (let i = currentIndex + 1; i < threads.length; i++) {
    const thread = threads[i];
    // Skip threads on the same file and line as current thread
    if (thread.filename !== currentFilename || thread.lineNumber !== currentLine) {
      nextThread = thread;
      break;
    }
  }

  if (nextThread) {
    selectedCommentChain.value = {
      filename: nextThread.filename,
      lineNumber: nextThread.lineNumber
    };
    selectedCommentLocation.value = null;

    // Scroll to the thread location
    scrollToThread(nextThread.filename, nextThread.lineNumber);

    // Focus the modal
    if (modalRef && modalRef.current) {
      modalRef.current.focus();
    }
  }
}

/**
 * Scroll to a specific thread location in the diff and file browser
 * @param {string} filename - The file path
 * @param {number} lineNumber - The line number
 */
function scrollToThread(filename, lineNumber) {
  // Use setTimeout to allow the modal update to complete first
  setTimeout(() => {
    // Set flag to indicate we're programmatically scrolling
    setIsUserScrolling(false);

    // Select the file - this will trigger directory browser scrolling via DirectoryEntry
    setSelectedFile(filename);

    // Scroll to the file card
    const fileCard = document.querySelector(`[data-filename="${filename}"]`);
    if (fileCard) {
      fileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // After file card scrolls, scroll to the specific line
    setTimeout(() => {
      const diffLine = document.querySelector(
        `[data-filename="${filename}"][data-line-number="${lineNumber}"]`
      );
      if (diffLine) {
        diffLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Reset flag after scroll animation completes
      setTimeout(() => {
        setIsUserScrolling(true);
      }, 1000);
    }, 300);
  }, 100);
}
