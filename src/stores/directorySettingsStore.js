/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

/**
 * Directory settings store using Preact signals
 * Manages two directory browser settings:
 * 1. startCollapsed - Whether directories start in collapsed state
 * 2. autoExpandOnScroll - Whether to auto-expand directories when scrolling to files
 */

// Initialize from localStorage
const initialStartCollapsed = typeof window !== 'undefined'
  ? localStorage.getItem('directory_start_collapsed') === 'true'
  : false;

const initialAutoExpandOnScroll = typeof window !== 'undefined'
  ? localStorage.getItem('directory_auto_expand_on_scroll') === 'true'
  : false;

export const startCollapsed = signal(initialStartCollapsed);
export const autoExpandOnScroll = signal(initialAutoExpandOnScroll);

export function setStartCollapsed(value) {
  startCollapsed.value = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('directory_start_collapsed', String(value));
  }
}

export function setAutoExpandOnScroll(value) {
  autoExpandOnScroll.value = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('directory_auto_expand_on_scroll', String(value));
  }
}

export function clearDirectorySettings() {
  setStartCollapsed(false);
  setAutoExpandOnScroll(false);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('directory_start_collapsed');
    localStorage.removeItem('directory_auto_expand_on_scroll');
  }
}
