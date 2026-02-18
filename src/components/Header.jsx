/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { ReposDropdown } from './ReposDropdown';
import { PullsDropdown } from './PullsDropdown';
import { showSettings } from '../stores/settingsStore.js';

export function Header({ authenticated, onLogout }) {
  return (
    <header className="header">
      <h1 className="header-icon">
        {'\ue709'}
      </h1>
      {authenticated && (
        <div className="header-repo-picker">
          <ReposDropdown />
        </div>
      )}
      {authenticated && (
        <div className="header-pr-picker">
          <PullsDropdown />
        </div>
      )}
      {authenticated && (
        <button onClick={showSettings} className="header-settings-button" title="Settings">
          {'\uf085'}
        </button>
      )}
      {authenticated && (
        <button onClick={onLogout} className="header-logout-button" title="Logout">
          Logout {'\udb81\uddfd'}
        </button>
      )}
    </header>
  );
}
