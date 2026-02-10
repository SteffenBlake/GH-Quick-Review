import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { LoginPage } from '../src/components/LoginPage';
import * as auth from '../src/utils/auth';

vi.mock('../src/utils/auth');

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
    const { getByPlaceholderText, getByRole } = render(<LoginPage onLogin={onLogin} />);
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: 'ghp_test123' } });
    await fireEvent.click(loginButton);
    
    expect(auth.setToken).toHaveBeenCalledWith('ghp_test123');
    expect(onLogin).toHaveBeenCalled();
  });

  it('trims whitespace from token before saving', async () => {
    const onLogin = vi.fn();
    const { getByPlaceholderText, getByRole } = render(<LoginPage onLogin={onLogin} />);
    
    const input = getByPlaceholderText('Enter your GitHub PAT');
    const loginButton = getByRole('button', { name: /Login/i });
    
    await fireEvent.input(input, { target: { value: '  ghp_test123  ' } });
    await fireEvent.click(loginButton);
    
    expect(auth.setToken).toHaveBeenCalledWith('ghp_test123');
    expect(onLogin).toHaveBeenCalled();
  });

  it('does not call setToken or onLogin when token is empty', async () => {
    const onLogin = vi.fn();
    const { getByRole } = render(<LoginPage onLogin={onLogin} />);
    
    const loginButton = getByRole('button', { name: /Login/i });
    await fireEvent.click(loginButton);
    
    expect(auth.setToken).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
  });
});
