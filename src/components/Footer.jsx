/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a
            href="https://github.com/SteffenBlake/GH-Quick-Review"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            {'\uea84'} Source Code
          </a>
          <a
            href="https://github.com/SteffenBlake/GH-Quick-Review/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            {'\uf188'} Report a bug
          </a>
        </div>
        <div className="footer-copyright">
          {'\udb81\udde6'} 2026 Steffen Blake • Released under{' '}
          <a
            href="https://raw.githubusercontent.com/SteffenBlake/GH-Quick-Review/refs/heads/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
