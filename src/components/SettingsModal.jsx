/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useRef, useState, useEffect } from 'preact/hooks';
import { 
  settings,
  saveSettings,
  getDefaultSettings,
  registerModalRef,
  setFont,
  setHighlightTheme
} from '../stores/settingsStore';
import { HIGHLIGHT_THEMES } from '../stores/highlightThemeStore.js';
import { FuzzyDropdown } from './FuzzyDropdown';

// Icon constant
const ICON_GEARS = '\uf085';

/**
 * Modal for managing application settings
 */
export function SettingsModal() {
  const modalRef = useRef(null);
  const [draftSettings, setDraftSettings] = useState(settings.value);

  // Register this modal's ref so the store can focus it directly when button is clicked
  useEffect(() => {
    registerModalRef(modalRef);
  }, []);

  // Sync draft settings when actual settings change (e.g., from logout)
  useEffect(() => {
    setDraftSettings(settings.value);
  }, [settings.value]);

  // Font options for the dropdown
  const fontOptions = [
    { value: 'FiraCode', label: 'Fira Code', searchableText: 'Fira Code FiraCode' },
    { value: 'JetBrainsMono', label: 'JetBrains Mono', searchableText: 'JetBrains Mono JetBrainsMono' },
  ];

  // Convert theme names to readable labels
  const themeOptions = HIGHLIGHT_THEMES.map(theme => {
    // Convert kebab-case to Title Case
    const label = theme
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      value: theme,
      label: label,
      searchableText: `${label} ${theme}`
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    
    // IMMEDIATELY focus the modal to prevent focus loss during state mutations
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    saveSettings(draftSettings);
    
    // After saving, blur to close the modal
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleCancel = () => {
    // Revert to current settings (discard changes)
    setDraftSettings(settings.value);
    
    // Blur to hide modal
    if (modalRef.current) {
      const focusedElement = modalRef.current.querySelector(':focus');
      if (focusedElement) {
        focusedElement.blur();
      }
      modalRef.current.blur();
    }
  };

  const handleReset = () => {
    // IMMEDIATELY focus the modal to prevent focus loss during state mutations
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
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
            Font
            <span className="settings-description">
              The font family to use across the application.
            </span>
          </label>
          <FuzzyDropdown
            value={draftSettings.font}
            onChange={(value) => handleInputChange('font', value)}
            options={fontOptions}
            placeholder="Select font..."
            className="settings-font-dropdown"
          />
        </div>

        <div className="settings-section">
          <label className="settings-label">
            Highlight Theme
            <span className="settings-description">
              The syntax highlighting theme for code blocks.
            </span>
          </label>
          <FuzzyDropdown
            value={draftSettings.highlightTheme}
            onChange={(value) => handleInputChange('highlightTheme', value)}
            options={themeOptions}
            placeholder="Select theme..."
            className="settings-theme-dropdown"
          />
        </div>

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
