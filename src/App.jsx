/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState } from 'preact/hooks';
import { isAuthenticated, clearToken } from './utils/auth';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export function App() {
  const [font, setFont] = useState('FiraCode');
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
  };

  return (
    <div className="app" style={{ fontFamily: font }}>
      <Header 
        font={font} 
        setFont={setFont} 
        authenticated={authenticated}
        onLogout={handleLogout}
      />
      {!authenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <main className="content">
          <h2>Welcome to GH Quick Review</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
            dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
            non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum.
          </p>
          <div className="code-sample">
            <code>
              const greeting = "Hello, World!";{'\n'}
              console.log(greeting);{'\n'}
              // Notice how the font changes!
            </code>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}
