/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState, useEffect } from 'preact/hooks';

const SPINNER_CHARS = ['\uee06', '\uee07', '\uee08', '\uee09', '\uee0a', '\uee0b'];
const SPINNER_INTERVAL = 100; // ms between frames

/**
 * Loading spinner component that cycles through nerd font spinner characters
 * @param {object} props - Component props
 * @param {string} props.text - Loading text to display (default: "Loading...")
 * @returns {JSX.Element}
 */
export function LoadingSpinner({ text = 'Loading...' }) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % SPINNER_CHARS.length);
    }, SPINNER_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="loading-spinner">
      {SPINNER_CHARS[frameIndex]} {text}
    </span>
  );
}
