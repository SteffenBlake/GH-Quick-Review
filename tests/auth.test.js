import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getToken, setToken, clearToken, isAuthenticated } from '../src/utils/auth';

describe('Auth Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setToken and getToken', () => {
    it('stores and retrieves a token', () => {
      const testToken = 'ghp_test123';
      setToken(testToken);
      expect(getToken()).toBe(testToken);
    });

    it('returns null when no token is set', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('clearToken', () => {
    it('removes the stored token', () => {
      setToken('ghp_test123');
      expect(getToken()).toBe('ghp_test123');
      
      clearToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when a token exists', () => {
      setToken('ghp_test123');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns false after clearing token', () => {
      setToken('ghp_test123');
      clearToken();
      expect(isAuthenticated()).toBe(false);
    });
  });
});
