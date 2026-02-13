/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import { highlightTheme, HIGHLIGHT_THEMES } from '../stores/highlightThemeStore.js';

// Create a mapping of theme names to their CSS content
// This forces Vite to bundle all themes at build time
const themeStylesheets = {};

HIGHLIGHT_THEMES.forEach(theme => {
  // This creates individual chunks for each theme
  themeStylesheets[theme] = () => import(`highlight.js/styles/${theme}.min.css`);
});

export function HighlightThemeLoader() {
  const linksCreated = useRef(false);
  const styleElements = useRef({});

  useEffect(() => {
    // Step 1: Load ALL theme CSS (only once)
    if (!linksCreated.current) {
      HIGHLIGHT_THEMES.forEach(async (themeName) => {
        try {
          // Import the CSS - this injects a <style> tag
          await import(`highlight.js/styles/${themeName}.min.css`);
          
          // Find the style tag that was just added (last one)
          const styleTags = Array.from(document.head.querySelectorAll('style'));
          const styleTag = styleTags[styleTags.length - 1];
          
          if (styleTag) {
            styleTag.dataset.hljsTheme = themeName;
            styleTag.disabled = true; // Disable all by default
            styleElements.current[themeName] = styleTag;
          }
        } catch (err) {
          console.warn(`Failed to load theme ${themeName}:`, err);
        }
      });
      linksCreated.current = true;
    }

    // Step 2: Enable ONLY the selected theme
    const currentTheme = highlightTheme.value;
    Object.entries(styleElements.current).forEach(([themeName, styleTag]) => {
      if (styleTag) {
        styleTag.disabled = (themeName !== currentTheme);
      }
    });
    
  }, [highlightTheme.value]);

  return null;
}
