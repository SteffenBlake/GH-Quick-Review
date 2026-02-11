/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState } from 'preact/hooks';
import { DiffLine } from './DiffLine.jsx';

/**
 * Component for rendering a single diff hunk
 * @param {Object} props
 * @param {Object} props.diff - Diff hunk object from diffsByFileStore
 * @param {string} props.filename - File path for this diff
 */
export function DiffHunk({ diff, filename }) {
  const [selectedLine, setSelectedLine] = useState(null);
  
  const { lines, newStart } = diff;
  
  const handleLineClick = (lineIndex) => {
    // Toggle selection - clicking same line deselects it
    setSelectedLine(selectedLine === lineIndex ? null : lineIndex);
  };
  
  // Calculate line numbers for each line in the hunk
  let currentLineNumber = newStart;
  const linesWithNumbers = lines.map((line, index) => {
    const isHunkHeader = line.startsWith('@@');
    const isRemoved = line.startsWith('-');
    const isAdded = line.startsWith('+');
    
    let lineNumber = null;
    if (!isHunkHeader) {
      if (!isRemoved) {
        lineNumber = currentLineNumber;
        currentLineNumber++;
      }
    }
    
    return {
      line,
      lineNumber,
      index
    };
  });
  
  return (
    <div className="diff-hunk">
      {linesWithNumbers.map((lineData) => (
        <DiffLine
          key={lineData.index}
          line={lineData.line}
          lineNumber={lineData.lineNumber}
          index={lineData.index}
          isSelected={selectedLine === lineData.index}
          onClick={() => handleLineClick(lineData.index)}
        />
      ))}
    </div>
  );
}
