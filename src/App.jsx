import { useState } from 'preact/hooks';
import { isAuthenticated, clearToken } from './utils/auth';
import { LoginPage } from './components/LoginPage';

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

  if (!authenticated) {
    return (
      <div className="app" style={{ fontFamily: font }}>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app" style={{ fontFamily: font }}>
      <header className="header">
        <h1>
          <span className="icon"></span> GH Quick Review
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
        <button onClick={handleLogout} className="logout-button" title="Logout">
          <span className="icon">󰗽</span>
        </button>
        </div>
      </header>
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
    </div>
  );
}
