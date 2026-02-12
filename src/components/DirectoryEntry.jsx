/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState, useEffect } from 'preact/hooks';
import { selectedFile, setSelectedFile } from '../stores/selectedFileStore.js';
import { setIsUserScrolling } from '../stores/scrollSyncStore.js';
import { getFileIcon, getGitStatusIcon } from '../utils/file-icons.js';
import { startCollapsed, autoExpandOnScroll } from '../stores/directorySettingsStore.js';

/**
 * A single directory or file entry in the tree
 * @param {Object} props
 * @param {Object} props.node - The tree node data
 * @param {number} props.depth - Current nesting depth
 */
export function DirectoryEntry({ node, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(!startCollapsed.value);
  
  // Auto-expand when selected file is in this directory's subtree
  useEffect(() => {
    if (!autoExpandOnScroll.value || isFile) return;
    
    // Check if the selected file is in this directory's subtree
    const isFileInSubtree = selectedFile.value?.startsWith(node.path + '/');
    
    if (isFileInSubtree && !isExpanded) {
      setIsExpanded(true);
    }
  }, [selectedFile.value, autoExpandOnScroll.value, isFile, node.path, isExpanded]);
  
  const isFile = node.isFile;
  const hasChildren = !isFile && node.children && Object.keys(node.children).length > 0;
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFile) {
      // Set flag to indicate we're programmatically scrolling (not user scrolling)
      setIsUserScrolling(false);
      
      // Select file
      setSelectedFile(node.path);
      
      // Scroll to the file card
      const fileCard = document.querySelector(`[data-filename="${node.path}"]`);
      if (fileCard) {
        fileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Reset flag after scroll animation completes
      setTimeout(() => {
        setIsUserScrolling(true);
      }, 1000);
    } else {
      // Toggle directory
      setIsExpanded(!isExpanded);
    }
  };
  
  // Get file/folder icon
  const fileIconData = getFileIcon(node.name, isFile);
  
  // Get git status icon
  const gitStatusData = getGitStatusIcon(node.status);
  
  // Check if this file is selected
  const isSelected = isFile && selectedFile.value === node.path;
  
  // Get chevron icon for directories
  const chevronIcon = !isFile ? (isExpanded ? '\uf078' : '\uf054') : null;
  
  return (
    <li className="directory-entry">
      <div
        className={`directory-entry-content ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 0.75}rem` }}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
      >
        {/* Git status indicator */}
        {gitStatusData && (
          <span className="git-status" style={{ color: gitStatusData.color }}>
            {gitStatusData.icon}
          </span>
        )}
        
        {/* Chevron for directories */}
        {chevronIcon && (
          <span className="chevron">
            {chevronIcon}
          </span>
        )}
        
        {/* File/folder icon */}
        <span 
          className="file-icon"
          style={{ color: fileIconData.color || 'inherit' }}
        >
          {fileIconData.icon}
        </span>
        
        {/* File/folder name */}
        <span 
          className="entry-name"
          style={{ color: gitStatusData ? gitStatusData.color : 'inherit' }}
        >
          {node.name}
        </span>
        
        {/* Comment indicator */}
        {isFile && node.commentCount > 0 && (
          <span className="comment-indicator">
            {'\udb80\udf62'}
          </span>
        )}
      </div>
      
      {/* Render children if directory is expanded */}
      {!isFile && hasChildren && isExpanded && (
        <ul className="directory-children">
          {Object.values(node.children)
            .sort((a, b) => {
              // Directories first, then files
              if (!a.isFile && b.isFile) return -1;
              if (a.isFile && !b.isFile) return 1;
              // Then alphabetically
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <DirectoryEntry key={child.path} node={child} depth={depth + 1} />
            ))}
        </ul>
      )}
    </li>
  );
}
