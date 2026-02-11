/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

/**
 * Unified error message signal
 * Any part of the app can set this to display an error page
 * Set to null to clear the error
 */
export const errorMessage = signal(null);

/**
 * Set an error message to be displayed
 * @param {string} message - Error message to display
 */
export function setError(message) {
  errorMessage.value = message;
}

/**
 * Clear the current error message
 */
export function clearError() {
  errorMessage.value = null;
}
