/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect } from 'preact/hooks';
import { highlightTheme } from '../stores/highlightThemeStore.js';

/**
 * Component that loads and manages highlight.js theme CSS
 * Uses Vite's dynamic import to load theme CSS from node_modules at build time
 */
export function HighlightThemeLoader() {
  useEffect(() => {
    const theme = highlightTheme.value;
    
    // Dynamically import the theme CSS
    // Vite will handle this at build time and code-split appropriately
    const loadTheme = async () => {
      try {
        // Dynamic import of CSS file - Vite will bundle this
        await import(`highlight.js/styles/${theme}.min.css`);
      } catch (err) {
        console.warn(`Failed to load theme: ${theme}`, err);
        // Fallback to default theme
        if (theme !== 'github-dark') {
          try {
            await import('highlight.js/styles/github-dark.min.css');
          } catch (fallbackErr) {
            console.error('Failed to load fallback theme', fallbackErr);
          }
        }
      }
    };
    
    loadTheme();
  }, [highlightTheme.value]);
  
  return null; // This component doesn't render anything
}
