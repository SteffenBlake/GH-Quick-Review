/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { currentToast, hideToast } from '../stores/toastStore';

/**
 * Toast notification component - displays in bottom-right corner
 */
export function Toast() {
  // Access .value in JSX for reactivity - don't destructure outside render
  if (!currentToast.value) {
    return null;
  }
  
  return (
    <div 
      className={`toast toast-${currentToast.value.type}`}
      data-testid="toast-notification"
      onClick={hideToast}
      role="status"
      aria-live="polite"
    >
      {currentToast.value.message}
    </div>
  );
}
