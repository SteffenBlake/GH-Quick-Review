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
      HIGHLIGHT_THEMES.forEach(themeName => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/node_modules/highlight.js/styles/${themeName}.min.css`;
        link.dataset.hljsTheme = themeName;
        link.disabled = true; // Disable by default
        document.head.appendChild(link);
      });
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
