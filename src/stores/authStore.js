/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';
import { clearSelectedRepo } from './selectedRepoStore';

/**
 * Auth store using Preact signals
 * Automatically persists to localStorage
 */

// Initialize from localStorage
const initialToken = typeof window !== 'undefined' 
  ? localStorage.getItem('github_pat') 
  : null;

export const token = signal(initialToken);

export function setToken(newToken) {
  token.value = newToken;
  if (typeof window !== 'undefined') {
    if (newToken) {
      localStorage.setItem('github_pat', newToken);
    } else {
      localStorage.removeItem('github_pat');
    }
  }
}

export function clearToken() {
  setToken(null);
  clearSelectedRepo(); // Clear selected repo on logout
}

export function getToken() {
  return token.value;
}

export function isAuthenticated() {
  return !!token.value;
}
