/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useComputed } from '@preact/signals';
import { currentToast, hideToast } from '../stores/toastStore';

/**
 * Toast notification component - displays in bottom-right corner  
 * Uses useComputed to make component reactive to signal changes
 */
export function Toast() {
  // useComputed makes this component reactive to signal changes
  const toast = useComputed(() => currentToast.value);
  
  if (!toast.value) {
    return null;
  }
  
  return (
    <div 
      className={`toast toast-${toast.value.type}`}
      data-testid="toast-notification"
      onClick={hideToast}
      role="status"
      aria-live="polite"
    >
      {toast.value.message}
    </div>
  );
}
