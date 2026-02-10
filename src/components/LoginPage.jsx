import { useState } from 'preact/hooks';
import { setToken } from '../utils/auth';

export function LoginPage({ onLogin }) {
  const [token, setTokenInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      setToken(token.trim());
      onLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>
          {'\udb80\udf06'} Login Required
        </h2>
        <p>Please enter your GitHub Personal Access Token to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your GitHub PAT"
            value={token}
            onInput={(e) => setTokenInput(e.target.value)}
            className="pat-input"
            autoFocus
          />
          <button type="submit" className="login-button">
            {'\udb80\udf42'} Login
          </button>
        </form>
        <div className="login-links">
          <a
            href="https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Generating-a-PAT-Token.md"
            target="_blank"
            rel="noopener noreferrer"
            className="login-link"
          >
            {'\ueaa4'} Guide: How to generate a PAT token
          </a>
          <a
            href="https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Should-You-Trust-This-App.md"
            target="_blank"
            rel="noopener noreferrer"
            className="login-link"
          >
            {'\uf071'} Warning: Should you trust this app?
          </a>
        </div>
      </div>
    </div>
  );
}
