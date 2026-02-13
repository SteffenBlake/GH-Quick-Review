/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRef, useState, useEffect } from 'preact/hooks';
import { 
  settingsModalOpen,
  settings,
  hideSettings,
  saveSettings,
  getDefaultSettings 
} from '../stores/settingsStore';

// Icon constant
const ICON_GEARS = '\uf085';

/**
 * Modal for managing application settings
 */
export function SettingsModal() {
  const modalRef = useRef(null);
  const [draftSettings, setDraftSettings] = useState(settings.value);

  const isModalActive = settingsModalOpen.value;

  // Auto-focus the modal when it becomes active
  // The CSS :focus-within handles visibility - focused = visible, not focused = hidden
  useEffect(() => {
    if (isModalActive && modalRef.current) {
      modalRef.current.focus();
      // Reset draft settings to current settings when opening
      setDraftSettings(settings.value);
    }
  }, [isModalActive]);

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(draftSettings);
    hideSettings();
    // Blur to hide modal
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleCancel = () => {
    // Revert to current settings (discard changes)
    setDraftSettings(settings.value);
    hideSettings();
    // Blur to hide modal
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleReset = () => {
    // Reset to defaults (but don't save or close)
    setDraftSettings(getDefaultSettings());
  };

  const handleInputChange = (field, value) => {
    setDraftSettings({
      ...draftSettings,
      [field]: value
    });
  };

  return (
    <div 
      ref={modalRef}
      className="settings-modal"
      tabIndex={-1}
    >
      {/* Header */}
      <div className="settings-modal-header">
        <h2>{ICON_GEARS} Settings</h2>
      </div>

      {/* Settings content (scrollable) */}
      <div className="settings-modal-content">
        <div className="settings-section">
          <label className="settings-label">
            Review Submission Comment
            <span className="settings-description">
              The prefab comment you will submit all reviews with.
            </span>
          </label>
          <textarea
            className="settings-textarea"
            data-testid="review-comment-textarea"
            value={draftSettings.reviewSubmissionComment}
            onChange={(e) => handleInputChange('reviewSubmissionComment', e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="settings-modal-footer">
        <button
          type="button"
          className="settings-reset-btn"
          onClick={handleReset}
        >
          Reset to Defaults
        </button>
        <div className="settings-modal-footer-right">
          <button
            type="button"
            className="settings-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="settings-save-btn"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
