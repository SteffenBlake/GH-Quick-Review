/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState, useEffect } from 'preact/hooks';
import { currentToast, hideToast } from '../stores/toastStore';

/**
 * Toast notification component - displays in bottom-right corner
 * Uses useState + useEffect to track signal changes
 */
export function Toast() {
  const [toast, setToast] = useState(currentToast.value);
  
  // Subscribe to signal changes
  useEffect(() => {
    // Update local state whenever signal changes
    const unsubscribe = currentToast.subscribe(value => {
      setToast(value);
    });
    
    return unsubscribe;
  }, []);
  
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
