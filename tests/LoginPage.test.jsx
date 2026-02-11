import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/preact';
import { LoginPage } from '../src/components/LoginPage';
import * as auth from '../src/utils/auth';
import { githubClient } from '../src/utils/github-client';

vi.mock('../src/utils/auth');
vi.mock('../src/utils/github-client', () => ({
  githubClient: {
    verifyToken: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    const { getByText, getByPlaceholderText } = render(<LoginPage onLogin={() => {}} />);
    
    expect(getByText(/Login Required/i)).toBeTruthy();
    expect(getByPlaceholderText('Enter your GitHub PAT')).toBeTruthy();
  });

  it('renders documentation links', () => {
    const { getByText } = render(<LoginPage onLogin={() => {}} />);
    
    expect(getByText(/Guide: How to generate a PAT token/i)).toBeTruthy();
    expect(getByText(/Warning: Should you trust this app/i)).toBeTruthy();
  });

  it('calls setToken and onLogin when form is submitted with valid token', async () => {
    const onLogin = vi.fn();
    githubClient.verifyToken.mockResolvedValue({ login: 'testuser' });
    
    const { getByPlaceholderText, getByRole } = render(<LoginPage onLogin={onLogin} />);
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: 'ghp_test123' } });
    await fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(githubClient.verifyToken).toHaveBeenCalledWith('ghp_test123');
      expect(auth.setToken).toHaveBeenCalledWith('ghp_test123');
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('trims whitespace from token before saving', async () => {
    const onLogin = vi.fn();
    githubClient.verifyToken.mockResolvedValue({ login: 'testuser' });
    
    const { getByPlaceholderText, getByRole } = render(<LoginPage onLogin={onLogin} />);
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: '  ghp_test123  ' } });
    await fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(githubClient.verifyToken).toHaveBeenCalledWith('ghp_test123');
      expect(auth.setToken).toHaveBeenCalledWith('ghp_test123');
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('does not call setToken or onLogin when token is empty', async () => {
    const onLogin = vi.fn();
    const { getByRole } = render(<LoginPage onLogin={onLogin} />);
    
    const loginButton = getByRole('button', { name: /Login/i });
    await fireEvent.click(loginButton);
    
    expect(githubClient.verifyToken).not.toHaveBeenCalled();
    expect(auth.setToken).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('shows error message when token verification fails with 401', async () => {
    const onLogin = vi.fn();
    githubClient.verifyToken.mockRejectedValue({ status: 401 });
    
    const { getByPlaceholderText, getByRole, getByText } = render(
      <LoginPage onLogin={onLogin} />
    );
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: 'invalid_token' } });
    await fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(getByText(/Invalid token/i)).toBeTruthy();
    });
    
    expect(auth.setToken).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('shows generic error message when verification fails with non-401 error', async () => {
    const onLogin = vi.fn();
    githubClient.verifyToken.mockRejectedValue({ status: 500 });
    
    const { getByPlaceholderText, getByRole, getByText } = render(
      <LoginPage onLogin={onLogin} />
    );
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: 'test_token' } });
    await fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(getByText(/Failed to verify token/i)).toBeTruthy();
    });
    
    expect(auth.setToken).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('shows loading state while verifying token', async () => {
    const onLogin = vi.fn();
    let resolveVerification;
    const verificationPromise = new Promise((resolve) => {
      resolveVerification = resolve;
    });
    githubClient.verifyToken.mockReturnValue(verificationPromise);
    
    const { getByPlaceholderText, getByRole, getByText } = render(
      <LoginPage onLogin={onLogin} />
    );
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: 'test_token' } });
    await fireEvent.click(loginButton);
    
    // Should show loading state
    expect(getByText(/Verifying token/i)).toBeTruthy();
    expect(loginButton).toHaveProperty('disabled', true);
    
    // Complete the verification
    resolveVerification({ login: 'testuser' });
    
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled();
    });
  });
});
