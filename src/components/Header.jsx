/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

export function Header({ font, setFont, authenticated, onLogout }) {
  return (
    <header className="header">
      <h1>
        {'\ue709'} GH Quick Review
      </h1>
      <div className="header-actions">
        <div className="font-picker">
          <label htmlFor="font-select">Font: </label>
          <select
            id="font-select"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            <option value="FiraCode">Fira Code</option>
            <option value="JetBrainsMono">JetBrains Mono</option>
          </select>
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
