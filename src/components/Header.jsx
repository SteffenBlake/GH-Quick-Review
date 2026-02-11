/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { ReposDropdown } from './ReposDropdown';
import { PullsDropdown } from './PullsDropdown';
import { FuzzyDropdown } from './FuzzyDropdown';
import { 
  highlightTheme, 
  setHighlightTheme, 
  HIGHLIGHT_THEMES 
} from '../stores/highlightThemeStore.js';

export function Header({ font, setFont, authenticated, onLogout }) {
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

  return (
    <header className="header">
      <div className="header-left">
        <h1>
          {'\ue709'}
        </h1>
        {authenticated && <ReposDropdown />}
        {authenticated && <PullsDropdown />}
      </div>
      <div className="header-right">
        <div className="font-picker">
          <label>Font: </label>
          <FuzzyDropdown
            value={font}
            onChange={setFont}
            options={fontOptions}
            placeholder="Select font..."
            className="font-fuzzy-select"
          />
        </div>
        <div className="theme-picker">
          <label>Theme: </label>
          <FuzzyDropdown
            value={highlightTheme.value}
            onChange={setHighlightTheme}
            options={themeOptions}
            placeholder="Select theme..."
            className="theme-fuzzy-select"
          />
        </div>
        {authenticated && (
          <button onClick={onLogout} className="logout-button" title="Logout">
            Logout {'\udb81\uddfd'}
          </button>
        )}
      </div>
    </header>
  );
}
