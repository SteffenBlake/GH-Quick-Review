/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import { token } from '../stores/authStore';
import { selectedPr } from '../stores/selectedPrStore';
import { useDirectoryTree } from '../stores/directoryTreeStore';
import { DirectoryEntry } from './DirectoryEntry';
import { LoadingSpinner } from './LoadingSpinner';

export function DirectoryBrowser() {
  const containerRef = useRef(null);
  const previousPrRef = useRef(selectedPr.value);
  const { tree, isLoading, error } = useDirectoryTree();
  
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
        <h2 className="directory-browser-header">Directory</h2>
        
        <div className="directory-browser-inner">
          {isLoading ? (
            <div className="directory-browser-loading">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="directory-browser-error">
              Error loading files
            </div>
          ) : Object.keys(tree).length === 0 ? (
            <div className="directory-browser-empty">
              No files changed
            </div>
          ) : (
            <ul className="directory-tree">
              {Object.values(tree)
                .sort((a, b) => {
                  // Directories first, then files
                  if (!a.isFile && b.isFile) return -1;
                  if (a.isFile && !b.isFile) return 1;
                  // Then alphabetically
                  return a.name.localeCompare(b.name);
                })
                .map((node) => (
                  <DirectoryEntry key={node.path} node={node} depth={0} />
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
