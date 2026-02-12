/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Store to manage scroll synchronization between directory browser and diff viewer
 * Prevents feedback loops by tracking the source of selection changes
 */

let isUserScrolling = true; // Default to true, false only during programmatic scrolls

/**
 * Set whether the current scroll is from user interaction or programmatic
 * @param {boolean} value - true if user is scrolling, false if programmatic
 */
export function setIsUserScrolling(value) {
  isUserScrolling = value;
}

/**
 * Get whether the current scroll is from user interaction
 * @returns {boolean} - true if user is scrolling
 */
export function getIsUserScrolling() {
  return isUserScrolling;
}
