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
  const toast = currentToast.value;
  
  if (!toast) {
    return null;
  }
  
  return (
    <div 
      className={`toast toast-${toast.type}`}
      data-testid="toast-notification"
      onClick={hideToast}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}
