/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import { highlightTheme } from '../stores/highlightThemeStore.js';

// Use Vite's glob import to get all highlight.js theme CSS files
const themeModules = import.meta.glob('highlight.js/styles/*.min.css', { 
  query: '?url',
  eager: true 
});

export function HighlightThemeLoader() {
  const linksCreated = useRef(false);

  useEffect(() => {
    // Step 1: Create <link> elements for ALL themes (only once)
    if (!linksCreated.current) {
      Object.entries(themeModules).forEach(([path, module]) => {
        // Extract theme name from path: 'highlight.js/styles/github-dark.min.css' -> 'github-dark'
        const themeName = path.match(/styles\/(.+)\.min\.css$/)[1];
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = module.default; // The actual URL after Vite processing
        link.dataset.hljsTheme = themeName;
        link.disabled = true; // ALL disabled initially
        document.head.appendChild(link);
      });
      linksCreated.current = true;
    }

    // Step 2: Enable ONLY the selected theme, disable all others
    const currentTheme = highlightTheme.value;
    document.querySelectorAll('link[data-hljs-theme]').forEach(link => {
      link.disabled = (link.dataset.hljsTheme !== currentTheme);
    });
    
  }, [highlightTheme.value]);

  return null;
}
