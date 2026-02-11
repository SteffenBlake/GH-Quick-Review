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
  
  const { lines } = diff;
  
  const handleLineClick = (lineIndex) => {
    // Toggle selection - clicking same line deselects it
    setSelectedLine(selectedLine === lineIndex ? null : lineIndex);
  };
  
  return (
    <div className="diff-hunk">
      {lines.map((line, index) => (
        <DiffLine
          key={index}
          line={line}
          index={index}
          isSelected={selectedLine === index}
          onClick={() => handleLineClick(index)}
        />
      ))}
    </div>
  );
}
