/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import { highlightTheme, HIGHLIGHT_THEMES } from '../stores/highlightThemeStore.js';

export function HighlightThemeLoader() {
  const linksCreated = useRef(false);

  useEffect(() => {
    // Step 1: Create <link> elements for ALL themes (only once)
    if (!linksCreated.current) {
      const loadAllThemes = async () => {
        for (const themeName of HIGHLIGHT_THEMES) {
          try {
            // Use Vite's dynamic import to get the actual URL
            const module = await import(`highlight.js/styles/${themeName}.min.css?url`);
            const themeUrl = module.default;
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = themeUrl;
            link.dataset.hljsTheme = themeName;
            link.disabled = true; // Disable by default
            document.head.appendChild(link);
          } catch (err) {
            console.warn(`Failed to load theme ${themeName}:`, err);
          }
        }
      };
      
      loadAllThemes();
      linksCreated.current = true;
    }

    // Step 2: Enable the selected theme, disable all others
    const currentTheme = highlightTheme.value;
    document.querySelectorAll('link[data-hljs-theme]').forEach(link => {
      link.disabled = (link.dataset.hljsTheme !== currentTheme);
    });
  }, [highlightTheme.value]);

  return null;
}
