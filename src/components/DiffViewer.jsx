/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useDiffsByFile } from '../stores/diffsByFileStore.js';
import { FileCard } from './FileCard.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';

/**
 * Main diff viewer component that displays all file changes
 */
export function DiffViewer() {
  const { diffsByFile, isLoading, error } = useDiffsByFile();

  if (isLoading) {
    return (
      <div className="diff-viewer-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="diff-viewer-error">
        <p>Error loading diffs: {error.message}</p>
      </div>
    );
  }

  if (!diffsByFile || diffsByFile.length === 0) {
    return (
      <div className="diff-viewer-empty">
        <p>No files changed</p>
      </div>
    );
  }

  return (
    <div className="diff-viewer">
      {diffsByFile.map((file) => (
        <FileCard key={file.filename} file={file} />
      ))}
    </div>
  );
}
