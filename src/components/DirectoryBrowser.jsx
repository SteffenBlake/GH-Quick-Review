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
  
  // Hide if not logged in or no PR selected
  if (!token.value || !selectedPr.value) {
    return null;
  }

  // Auto-expand when PR selection changes
  useEffect(() => {
    if (containerRef.current && selectedPr.value) {
      containerRef.current.focus();
    }
  }, [selectedPr.value]);

  const handleExpandClick = () => {
    containerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="directory-browser" tabIndex={-1}>
      <button 
        className="directory-browser-toggle"
        onClick={handleExpandClick}
        aria-label="Expand directory browser"
      >
        {'\udb80\udd3e'}
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
