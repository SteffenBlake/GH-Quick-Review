/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import iconsByFilename from './icons-by-filename.js';
import iconsByExtension from './icons-by-file-extension.js';

/**
 * Get the icon for a file or directory
 * Priority: filename > extension > generic file/folder icon
 * 
 * @param {string} name - The file or directory name
 * @param {boolean} isFile - Whether this is a file (true) or directory (false)
 * @returns {Object} - Icon object with { icon: string, color: string }
 */
export function getFileIcon(name, isFile = true) {
  if (!isFile) {
    // Return folder icon
    return {
      icon: '\uea83', // Folder icon
      color: null, // No specific color, will use default
    };
  }

  // Check for exact filename match first
  const lowerName = name.toLowerCase();
  if (iconsByFilename[lowerName]) {
    return {
      icon: iconsByFilename[lowerName].icon,
      color: iconsByFilename[lowerName].color,
    };
  }

  // Check for file extension
  const parts = name.split('.');
  if (parts.length > 1) {
    const extension = parts[parts.length - 1].toLowerCase();
    if (iconsByExtension[extension]) {
      return {
        icon: iconsByExtension[extension].icon,
        color: iconsByExtension[extension].color,
      };
    }
  }

  // Return generic file icon
  return {
    icon: '\uea7b', // Generic file icon
    color: null,
  };
}

/**
 * Get the git status icon and color
 * 
 * @param {string} status - The git status ('added', 'removed', 'modified', etc.)
 * @returns {Object|null} - Icon object with { icon: string, color: string } or null if no status
 */
export function getGitStatusIcon(status) {
  if (!status) return null;

  const statusLower = status.toLowerCase();
  
  // Added files show a plus sign in green
  if (statusLower === 'added') {
    return { icon: '+', color: '#4ade80' }; // green
  }
  
  // Removed files show a minus sign in red
  if (statusLower === 'removed') {
    return { icon: '-', color: '#f87171' }; // red
  }
  
  // Modified/changed files show a tilde in green
  if (statusLower === 'modified' || statusLower === 'changed') {
    return { icon: '~', color: '#4ade80' }; // green
  }
  
  return null;
}

/**
 * Check if a file is a binary file based on extension
 * 
 * @param {string} filename - The file name
 * @returns {boolean} - True if the file is likely binary
 */
export function isBinaryFile(filename) {
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'svg',
    'zip', 'tar', 'gz', 'rar', '7z',
    'exe', 'dll', 'so', 'dylib',
    'pdf', 'doc', 'docx', 'xls', 'xlsx',
    'ttf', 'otf', 'woff', 'woff2', 'eot',
  ];
  
  const parts = filename.split('.');
  if (parts.length > 1) {
    const extension = parts[parts.length - 1].toLowerCase();
    return binaryExtensions.includes(extension);
  }
  
  return false;
}
