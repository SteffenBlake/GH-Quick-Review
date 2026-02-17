/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

// Get toast duration from env var (for tests) or use default 4s
const DEFAULT_TOAST_DURATION = 4000;
export const toastDuration = parseInt(
  import.meta.env.VITE_TOAST_DURATION || DEFAULT_TOAST_DURATION,
  10
);

// Toast state: null when no toast, or { message, type } when showing
export const currentToast = signal(null);

let hideTimeout = null;

/**
 * Show a toast notification
 * @param {string} message - Toast message text
 * @param {string} type - Toast type: 'success', 'error', 'info' (default: 'info')
 */
export function showToast(message, type = 'info') {
  // Clear any existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  // Set the toast
  currentToast.value = { message, type };

  // Auto-hide after duration
  hideTimeout = setTimeout(() => {
    currentToast.value = null;
    hideTimeout = null;
  }, toastDuration);
}

/**
 * Hide the current toast immediately
 */
export function hideToast() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  currentToast.value = null;
}
