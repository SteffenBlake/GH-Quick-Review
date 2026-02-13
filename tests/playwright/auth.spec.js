import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Authentication Flow', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Should show login required heading with key icon
      await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
      
      // Should show PAT input field
      await expect(page.getByPlaceholder('Enter your GitHub PAT')).toBeVisible();
      
      // Should show login button
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      
      // Should show documentation links
      await expect(page.getByRole('link', { name: /Guide: How to generate a PAT token/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Warning: Should you trust this app/i })).toBeVisible();
      
      // Should NOT show main content
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should save token to localStorage and show main content on login', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Fill in token and login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token_12345');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should show main content after login
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).toBeVisible();
      
      // Should NOT show login page
      await expect(page.getByRole('heading', { name: /Login Required/i })).not.toBeVisible();
      
      // Verify token was saved to localStorage
      const savedToken = await page.evaluate(() => localStorage.getItem('github_pat'));
      expect(savedToken).toBe('test_token_12345');
    } finally {
      await mockServer.stop();
    }
  });

  test('should trim whitespace from token before saving', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Enter token with leading/trailing whitespace
      await page.getByPlaceholder('Enter your GitHub PAT').fill('  test_token_spaces  ');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should show main content
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).toBeVisible();
      
      // Token should be trimmed in localStorage
      const savedToken = await page.evaluate(() => localStorage.getItem('github_pat'));
      expect(savedToken).toBe('test_token_spaces');
    } finally {
      await mockServer.stop();
    }
  });

  test('should not allow login with empty token', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Try to login with empty token
      await page.getByPlaceholder('Enter your GitHub PAT').fill('   ');
      
      // Button should be disabled or clicking should do nothing
      const loginButton = page.getByRole('button', { name: 'Login' });
      await loginButton.click();
      
      // Should still show login page
      await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
      
      // Should NOT show main content
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show logout button when authenticated', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.setItem('github_pat', 'test_token'));
      await page.reload();
      
      // Should show logout button
      await expect(page.getByRole('button', { name: /Logout/i })).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear token and return to login page on logout', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.setItem('github_pat', 'test_token'));
      await page.reload();
      
      // Should show main content initially
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).toBeVisible();
      
      // Click logout
      await page.getByRole('button', { name: /Logout/i }).click();
      
      // Should show login page
      await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
      
      // Token should be removed from localStorage
      const savedToken = await page.evaluate(() => localStorage.getItem('github_pat'));
      expect(savedToken).toBeNull();
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should show main content
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).toBeVisible();
      
      // Reload page
      await page.reload();
      
      // Should still show main content (not login page)
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).toBeVisible();
      await expect(page.getByRole('heading', { name: /Login Required/i })).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show login page if localStorage is cleared externally', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await mockServer.checkHeartbeat();
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.setItem('github_pat', 'test_token'));
      await page.reload();
      
      // Should show main content initially
      await expect(page.getByText(/Please select a Repo and a Pull Request to review!/i)).toBeVisible();
      
      // Clear localStorage externally
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Should show login page
      await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });
});
