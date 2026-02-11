/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { signal } from '@preact/signals';

/**
 * Available highlight.js themes
 * List generated from highlight.js/styles directory
 */
export const HIGHLIGHT_THEMES = [
  '1c-light',
  'a11y-dark',
  'a11y-light',
  'agate',
  'an-old-hope',
  'androidstudio',
  'arduino-light',
  'arta',
  'ascetic',
  'atom-one-dark',
  'atom-one-dark-reasonable',
  'atom-one-light',
  'brown-paper',
  'codepen-embed',
  'color-brewer',
  'cybertopia-cherry',
  'cybertopia-dimmer',
  'cybertopia-icecap',
  'cybertopia-saturated',
  'dark',
  'default',
  'devibeans',
  'docco',
  'far',
  'felipec',
  'foundation',
  'github',
  'github-dark',
  'github-dark-dimmed',
  'gml',
  'googlecode',
  'gradient-dark',
  'gradient-light',
  'grayscale',
  'hybrid',
  'idea',
  'intellij-light',
  'ir-black',
  'isbl-editor-dark',
  'isbl-editor-light',
  'kimbie-dark',
  'kimbie-light',
  'lightfair',
  'lioshi',
  'magula',
  'mono-blue',
  'monokai',
  'monokai-sublime',
  'night-owl',
  'nnfx-dark',
  'nnfx-light',
  'nord',
  'obsidian',
  'panda-syntax-dark',
  'panda-syntax-light',
  'paraiso-dark',
  'paraiso-light',
  'pojoaque',
  'purebasic',
  'qtcreator-dark',
  'qtcreator-light',
  'rainbow',
  'rose-pine',
  'rose-pine-dawn',
  'rose-pine-moon',
  'routeros',
  'school-book',
  'shades-of-purple',
  'srcery',
  'stackoverflow-dark',
  'stackoverflow-light',
  'sunburst',
  'tokyo-night-dark',
  'tokyo-night-light',
  'tomorrow-night-blue',
  'tomorrow-night-bright',
  'vs',
  'vs2015',
  'xcode',
  'xt256',
];

/**
 * Selected highlight theme signal
 * Persisted to localStorage
 */
export const highlightTheme = signal(
  localStorage.getItem('highlight_theme') || 'github-dark'
);

/**
 * Set the highlight theme
 * @param {string} theme - Theme name (must be in HIGHLIGHT_THEMES)
 */
export function setHighlightTheme(theme) {
  if (!HIGHLIGHT_THEMES.includes(theme)) {
    console.warn(`Invalid highlight theme: ${theme}`);
    return;
  }
  
  highlightTheme.value = theme;
  localStorage.setItem('highlight_theme', theme);
}

/**
 * Get the current highlight theme
 * @returns {string} - Current theme name
 */
export function getHighlightTheme() {
  return highlightTheme.value;
}
