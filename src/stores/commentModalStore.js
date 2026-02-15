/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

// Currently selected comment chain (null when no chain is selected)
export const selectedCommentChain = signal(null);

// Selected file and line for new comment
export const selectedCommentLocation = signal(null);

// Ref to the modal element for direct focus control
let modalRef = null;

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
