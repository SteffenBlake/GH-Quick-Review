/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

/**
 * Selected repo store using Preact signals
 * Automatically persists to localStorage
 */

// Initialize from localStorage
const initialRepo = typeof window !== 'undefined' 
  ? localStorage.getItem('selected_repo') 
  : '';

export const selectedRepo = signal(initialRepo || '');

export function setSelectedRepo(repo) {
  selectedRepo.value = repo;
  if (typeof window !== 'undefined') {
    if (repo) {
      localStorage.setItem('selected_repo', repo);
    } else {
      localStorage.removeItem('selected_repo');
    }
  }
}

export function clearSelectedRepo() {
  setSelectedRepo('');
}

export function getSelectedRepo() {
  return selectedRepo.value;
}
