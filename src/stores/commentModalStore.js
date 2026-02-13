/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

// Modal visibility state
export const isCommentModalVisible = signal(false);

// Currently selected comment chain (null when no chain is selected)
export const selectedCommentChain = signal(null);

// Selected file and line for new comment
export const selectedCommentLocation = signal(null);

/**
 * Show the comment modal with a specific comment chain
 * @param {Object} commentChain - The comment chain to display
 */
export function showCommentModal(commentChain) {
  selectedCommentChain.value = commentChain;
  selectedCommentLocation.value = null;
  isCommentModalVisible.value = true;
}

/**
 * Show the comment modal for creating a new comment at a specific location
 * @param {string} filename - The file path
 * @param {number} lineNumber - The line number
 */
export function showNewCommentModal(filename, lineNumber) {
  selectedCommentLocation.value = { filename, lineNumber };
  selectedCommentChain.value = null;
  isCommentModalVisible.value = true;
}

/**
 * Hide the comment modal and clear state
 */
export function hideCommentModal() {
  isCommentModalVisible.value = false;
  selectedCommentChain.value = null;
  selectedCommentLocation.value = null;
}
