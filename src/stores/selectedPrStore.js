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

// Initialize from localStorage - parse as number
const initialPr = typeof window !== 'undefined' 
  ? localStorage.getItem('selected_pr') 
  : '';

// Convert to number if it exists, otherwise empty string
const parsedPr = initialPr ? parseInt(initialPr, 10) : '';

export const selectedPr = signal(parsedPr);

export function setSelectedPr(pr) {
  // Always store as number (or empty string)
  const numericPr = pr ? (typeof pr === 'number' ? pr : parseInt(pr, 10)) : '';
  selectedPr.value = numericPr;
  
  if (typeof window !== 'undefined') {
    if (numericPr) {
      localStorage.setItem('selected_pr', numericPr.toString());
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
