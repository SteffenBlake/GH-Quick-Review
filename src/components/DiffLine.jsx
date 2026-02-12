/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import hljs from 'highlight.js';

// Icon constants
const ICON_MESSAGE_ALERT = '\udb80\udf62';
const ICON_MESSAGE_PLUS = '\udb81\ude53';

/**
 * Map file extension to highlight.js language class
 * @param {string} filename - The filename 
 * @returns {string} - The language class (e.g., 'language-javascript')
 */
function getLanguageClass(filename) {
  if (!filename) return 'language-plaintext';
  
  const ext = filename.split('.').pop().toLowerCase();
  
  // Map common extensions to hljs languages
  const extMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'md': 'markdown',
    'sql': 'sql',
    'vim': 'vim',
    'diff': 'diff',
    'patch': 'diff',
  };
  
  const language = extMap[ext] || 'plaintext';
  return `language-${language}`;
}

/**
 * Get line type and git icon from the line content
 * @param {string} line - The line content
 * @returns {Object} - { type: 'added'|'removed'|'context'|'hunk', icon, color }
 */
function getLineType(line) {
  if (line.startsWith('@@')) {
    return { type: 'hunk', icon: null, color: '#a0a0a0' };
  }
  if (line.startsWith('+')) {
    return { type: 'added', icon: '+', color: '#4ade80' };
  }
  if (line.startsWith('-')) {
    return { type: 'removed', icon: '-', color: '#f87171' };
  }
  return { type: 'context', icon: ' ', color: 'inherit' };
}

/**
 * Extract the actual code content from a diff line
 * @param {string} line - The line content with git prefix
 * @returns {string} - The code without the +/- prefix
 */
function getCodeContent(line) {
  if (line.startsWith('@@')) {
    return line; // Hunk headers stay as-is
  }
  if (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) {
    const content = line.substring(1); // Remove first character
    // Return a space for empty lines to prevent visual glitches in <code> elements
    return content === '' ? ' ' : content;
  }
  return line;
}

/**
 * Component for rendering a single line in a diff
 * @param {Object} props
 * @param {string} props.line - The line content
 * @param {number|null} props.lineNumber - The actual line number in the file (null for removed lines and hunk headers)
 * @param {number} props.index - Line index in the hunk
 * @param {boolean} props.isSelected - Whether this line is selected/picked
 * @param {Function} props.onClick - Click handler
 */
export function DiffLine({ line, lineNumber, index, filename, isSelected, onClick }) {
  const lineInfo = getLineType(line);
  const codeContent = getCodeContent(line);
  const isHunkHeader = lineInfo.type === 'hunk';
  const codeRef = useRef(null);
  const languageClass = getLanguageClass(filename);
  
  // For now, no messages exist (we'll implement this when comments are integrated)
  const hasMessage = false;
  
  // Apply syntax highlighting when code content changes
  useEffect(() => {
    if (codeRef.current && !isHunkHeader) {
      // Apply highlight.js to the code element
      hljs.highlightElement(codeRef.current);
    }
  }, [codeContent, isHunkHeader]);
  
  return (
    <div 
      className={`diff-line diff-line-${lineInfo.type} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Message button gutter */}
      <span className="diff-line-message-gutter">
        {hasMessage ? (
          <button className="diff-line-message-btn has-message">
            {ICON_MESSAGE_ALERT}
          </button>
        ) : (
          <button className="diff-line-message-btn add-message">
            {ICON_MESSAGE_PLUS}
          </button>
        )}
      </span>
      
      {/* Git icon */}
      <span className="diff-line-git-icon" style={{ color: lineInfo.color }}>
        {!isHunkHeader ? lineInfo.icon : ''}
      </span>
      
      {/* Line number - only show for non-hunk-header lines that have a line number */}
      {!isHunkHeader && lineNumber !== null && (
        <span className="diff-line-number">
          {lineNumber}
        </span>
      )}
      
      {/* Empty space for removed lines to keep alignment */}
      {!isHunkHeader && lineNumber === null && (
        <span className="diff-line-number"></span>
      )}
      
      {/* Code content */}
      <pre className="diff-line-code">
        <code ref={codeRef} className={`${languageClass} hljs`}>{codeContent}</code>
      </pre>
    </div>
  );
}
