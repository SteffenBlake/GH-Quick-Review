/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import { token } from '../stores/authStore';
import { selectedPr } from '../stores/selectedPrStore';

export function DirectoryBrowser() {
  const containerRef = useRef(null);
  const previousPrRef = useRef(selectedPr.value);
  
  // Hide if not logged in or no PR selected
  if (!token.value || !selectedPr.value) {
    return null;
  }

  // Auto-expand when PR selection changes (but NOT on initial mount/reload)
  useEffect(() => {
    // Only focus if the PR value actually changed (not on mount)
    if (previousPrRef.current !== selectedPr.value && previousPrRef.current !== null) {
      containerRef.current?.focus();
    }
    // Update the previous PR value
    previousPrRef.current = selectedPr.value;
  }, [selectedPr.value]);

  const handleToggleClick = (e) => {
    e.preventDefault(); // Prevent default mouse behavior
    
    // Check if currently focused (expanded)
    const isFocused = containerRef.current?.matches(':focus-within');
    
    if (isFocused) {
      // Collapse by blurring whatever has focus
      if (document.activeElement) {
        document.activeElement.blur();
      }
    } else {
      // Expand by focusing the container
      containerRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className="directory-browser" tabIndex={-1}>
      <button 
        className="directory-browser-toggle"
        onMouseDown={handleToggleClick}
        tabIndex={-1}
        aria-label="Toggle directory browser"
      >
      </button>
      
      <div className="directory-browser-content">
        {/* Content will be added in next session */}
        <div className="directory-browser-placeholder">
          Directory Browser Content (Coming Soon)
        </div>
      </div>
    </div>
  );
}
