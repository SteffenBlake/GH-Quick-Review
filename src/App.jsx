/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { useState } from 'preact/hooks';
import { token, clearToken } from './stores/authStore';
import { errorMessage, clearError } from './stores/errorStore';
import { selectedPr } from './stores/selectedPrStore';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DirectoryBrowser } from './components/DirectoryBrowser';
import { DiffViewer } from './components/DiffViewer';
import { HighlightThemeLoader } from './components/HighlightThemeLoader';
import { CommentModal } from './components/CommentModal';

function MainContent() {
  // Check for any errors in the unified error store
  if (errorMessage.value) {
    return (
      <main className="content content-centered">
        <div className="error-page">
          <h2>{'\uf071'} Error</h2>
          <p className="error-message">{errorMessage.value}</p>
          <p>Please logout and log back in to try again.</p>
        </div>
      </main>
    );
  }

  // Show diff viewer if a PR is selected
  if (selectedPr.value) {
    return (
      <main className="content">
        <DiffViewer />
      </main>
    );
  }

  // Fallback empty state when no content is selected
  return (
    <main className="content content-centered">
      <h2 aria-label="I dunno lol">{`¯\\(°_o)/¯`}</h2>
      <p>Please select a Repo and a Pull Request to review!</p>
    </main>
  );
}

export function App() {
  const [font, setFont] = useState('FiraCode');

  const handleLogout = () => {
    clearToken();
    queryClient.clear(); // Clear all cached queries on logout
    clearError(); // Clear error state on logout
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
        <HighlightThemeLoader />
        <DirectoryBrowser />
        <CommentModal />
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
