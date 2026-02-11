/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { useState } from 'preact/hooks';
import { token, clearToken } from './stores/authStore';
import { reposError } from './stores/reposStore';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function MainContent() {
  // Check for any errors in the store
  if (reposError.value) {
    return (
      <main className="content content-centered">
        <div className="error-page">
          <h2>{'\uf071'} Error</h2>
          <p className="error-message">{reposError.value}</p>
          <p>Please logout and log back in to try again.</p>
        </div>
      </main>
    );
  }

  // Main content - repos dropdown in header handles its own loading
  return (
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
  );
}

export function App() {
  const [font, setFont] = useState('FiraCode');

  const handleLogout = () => {
    clearToken();
    queryClient.clear(); // Clear all cached queries on logout
    reposError.value = null; // Clear error state on logout
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app" style={{ fontFamily: font }}>
        <Header 
          font={font} 
          setFont={setFont} 
          authenticated={!!token.value}
          onLogout={handleLogout}
        />
        {!token.value ? (
          <LoginPage />
        ) : (
          <MainContent />
        )}
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
