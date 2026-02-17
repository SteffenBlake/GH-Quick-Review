/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

// Default settings values
const DEFAULT_SETTINGS = {
  reviewSubmissionComment: '@copilot Read your agent file IN FULL before proceeding. Please address all PR comments below.',
};

// Load settings from localStorage or use defaults
function loadSettings() {
  const stored = localStorage.getItem('gh_quick_review_settings');
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse stored settings:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }
  return { ...DEFAULT_SETTINGS };
}

// Settings state
export const settings = signal(loadSettings());

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
 * Show the settings modal by focusing it
 */
export function showSettings() {
  // Directly focus the modal
  if (modalRef && modalRef.current) {
    modalRef.current.focus();
  }
}

/**
 * Save settings to localStorage
 * @param {Object} newSettings - The settings object to save
 */
export function saveSettings(newSettings) {
  settings.value = newSettings;
  localStorage.setItem('gh_quick_review_settings', JSON.stringify(newSettings));
}

/**
 * Reset settings to defaults
 */
export function resetSettings() {
  settings.value = { ...DEFAULT_SETTINGS };
}

/**
 * Clear all settings (called on logout)
 */
export function clearSettings() {
  settings.value = { ...DEFAULT_SETTINGS };
  localStorage.removeItem('gh_quick_review_settings');
}

/**
 * Get default settings (for reset button)
 */
export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}
