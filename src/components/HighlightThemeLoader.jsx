/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect } from 'preact/hooks';
import { highlightTheme } from '../stores/highlightThemeStore.js';

/**
 * Component that loads and manages highlight.js theme CSS
 * Should be rendered once in the app to handle theme switching
 */
export function HighlightThemeLoader() {
  useEffect(() => {
    const theme = highlightTheme.value;
    const linkId = 'hljs-theme';
    
    // Remove existing theme link
    const existingLink = document.getElementById(linkId);
    if (existingLink) {
      existingLink.remove();
    }
    
    // Dynamically import the theme CSS from node_modules
    // Using import() to load the CSS file
    import(`highlight.js/styles/${theme}.min.css?inline`).catch((err) => {
      console.warn(`Failed to load highlight.js theme: ${theme}`, err);
      // Fallback to a basic theme if the requested one doesn't exist
      if (theme !== 'github-dark') {
        import('highlight.js/styles/github-dark.min.css?inline').catch(console.error);
      }
    });
  }, [highlightTheme.value]);
  
  return null; // This component doesn't render anything
}
