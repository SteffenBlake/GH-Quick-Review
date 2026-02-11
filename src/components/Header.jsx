/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { ReposDropdown } from './ReposDropdown';
import { PullsDropdown } from './PullsDropdown';
import { FuzzyDropdown } from './FuzzyDropdown';

export function Header({ font, setFont, authenticated, onLogout }) {
  const fontOptions = [
    { value: 'FiraCode', label: 'Fira Code', searchableText: 'Fira Code FiraCode' },
    { value: 'JetBrainsMono', label: 'JetBrains Mono', searchableText: 'JetBrains Mono JetBrainsMono' },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <h1>
          {'\ue709'} GH Quick Review
        </h1>
        {authenticated && <ReposDropdown />}
        {authenticated && <PullsDropdown />}
      </div>
      <div className="header-right">
        <div className="font-picker">
          <label htmlFor="font-select">Font: </label>
          <FuzzyDropdown
            value={font}
            onChange={setFont}
            options={fontOptions}
            placeholder="Select font..."
            className="font-fuzzy-select"
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
