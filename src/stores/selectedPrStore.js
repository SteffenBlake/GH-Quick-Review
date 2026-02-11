/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

/**
 * Selected PR store using Preact signals
 * Automatically persists to localStorage
 */

// Initialize from localStorage
const initialPr = typeof window !== 'undefined' 
  ? localStorage.getItem('selected_pr') 
  : '';

export const selectedPr = signal(initialPr || '');

export function setSelectedPr(pr) {
  selectedPr.value = pr;
  if (typeof window !== 'undefined') {
    if (pr) {
      localStorage.setItem('selected_pr', pr);
    } else {
      localStorage.removeItem('selected_pr');
    }
  }
}

export function clearSelectedPr() {
  setSelectedPr('');
}

export function getSelectedPr() {
  return selectedPr.value;
}
