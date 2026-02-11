/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { getFileIcon, getGitStatusIcon } from '../utils/file-icons.js';
import { DiffHunk } from './DiffHunk.jsx';

/**
 * Get the filename from a full path
 * @param {string} path - Full file path
 * @returns {string} - Just the filename
 */
function getFilename(path) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Card component for displaying a single file's diffs
 * @param {Object} props
 * @param {Object} props.file - File object from diffsByFileStore
 */
export function FileCard({ file }) {
  const { filename, status, additions, deletions, diffs } = file;
  
  // Get icons
  const gitStatusData = getGitStatusIcon(status);
  const fileIconData = getFileIcon(getFilename(filename), true);
  
  // Determine filename color based on status
  const getFilenameColor = () => {
    if (status === 'added') return '#4ade80'; // green
    if (status === 'removed') return '#f87171'; // red
    if (status === 'modified') return '#4ade80'; // green
    return 'inherit';
  };
  
  return (
    <div className="file-card">
      <div className="file-card-header">
        {/* Git status icon */}
        {gitStatusData && (
          <span className="file-card-status" style={{ color: gitStatusData.color }}>
            {gitStatusData.icon}
          </span>
        )}
        
        {/* File icon */}
        <span 
          className="file-card-icon"
          style={{ color: fileIconData.color || 'inherit' }}
        >
          {fileIconData.icon}
        </span>
        
        {/* Filename */}
        <span className="file-card-filename" style={{ color: getFilenameColor() }}>
          {filename}
        </span>
        
        {/* Line counts */}
        <div className="file-card-stats">
          {additions > 0 && (
            <span className="file-card-additions">
              +{additions}
            </span>
          )}
          {deletions > 0 && (
            <span className="file-card-deletions">
              -{deletions}
            </span>
          )}
        </div>
      </div>
      
      <div className="file-card-body">
        {diffs.map((diff, index) => (
          <DiffHunk key={index} diff={diff} filename={filename} />
        ))}
      </div>
    </div>
  );
}
