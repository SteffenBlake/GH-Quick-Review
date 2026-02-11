/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

/**
 * The currently selected file path in the directory browser
 * @type {Signal<string|null>}
 */
export const selectedFile = signal(null);

/**
 * Set the selected file path
 * @param {string|null} filePath - The file path to select, or null to clear selection
 */
export function setSelectedFile(filePath) {
  selectedFile.value = filePath;
}

/**
 * Clear the selected file
 */
export function clearSelectedFile() {
  selectedFile.value = null;
}
