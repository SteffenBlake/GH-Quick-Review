import { describe, it, expect, vi, beforeEach } from 'vitest';
import GitHubClient from '../src/utils/github-client';
import * as auth from '../src/utils/auth';

vi.mock('../src/utils/auth');

describe('GitHubClient', () => {
  let client;
  let mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GitHubClient('https://api.test.com');
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  describe('get', () => {
    it('makes authenticated GET request with provided token', async () => {
      const mockResponse = { login: 'testuser' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.get('/user', 'test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/user',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('uses stored token when no token provided', async () => {
      auth.getToken.mockReturnValue('stored-token');
      const mockResponse = { login: 'testuser' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await client.get('/user');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer stored-token',
          }),
        })
      );
    });

    it('throws error when no token available', async () => {
      auth.getToken.mockReturnValue(null);

      await expect(client.get('/user')).rejects.toThrow(
        'No authentication token provided'
      );
    });

    it('throws error with status code when request fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      try {
        await client.get('/user', 'invalid-token');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('401');
        expect(error.status).toBe(401);
      }
    });

    it('includes correct GitHub API headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/user', 'test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': 'Bearer test-token',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        })
      );
    });
  });

  describe('verifyToken', () => {
    it('returns user data when token is valid', async () => {
      const mockUser = { login: 'testuser', id: 123 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await client.verifyToken('valid-token');

      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/user',
        expect.any(Object)
      );
    });

    it('throws error when token is invalid', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(client.verifyToken('invalid-token')).rejects.toThrow();
    });
  });

  describe('getUser', () => {
    it('fetches authenticated user with stored token', async () => {
      auth.getToken.mockReturnValue('stored-token');
      const mockUser = { login: 'testuser' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await client.getUser();

      expect(result).toEqual(mockUser);
    });
  });
});
