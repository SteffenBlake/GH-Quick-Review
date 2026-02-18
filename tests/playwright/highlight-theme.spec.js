import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

/**
 * Highlight Theme Tests
 * Ensures the highlight theme dropdown in Settings modal works correctly and persists selection
 */
test.describe('Highlight Theme', { tag: '@parallel' }, () => {
  test('should not show theme dropdown in header when logged out', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Theme dropdown should NOT be visible in header when logged out
      const themeDropdown = page.locator('.theme-fuzzy-select');
      await expect(themeDropdown).not.toBeVisible();

      // Settings button should NOT be visible when logged out
      const settingsButton = page.locator('.header-settings-button');
      await expect(settingsButton).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display theme dropdown in settings with default value', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings modal
      await page.locator('.header-settings-button').click();
      const modal = page.locator('.settings-modal');
      await expect(modal).toBeFocused({ timeout: 1000 });

      // Theme dropdown should be visible in settings
      const themeDropdown = page.locator('.settings-theme-dropdown');
      await expect(themeDropdown).toBeVisible();

      // Should show default theme 'github-dark' in UI
      await expect(themeDropdown).toContainText('Github Dark');
    } finally {
      await mockServer.stop();
    }
  });

  test('should allow selecting a different theme', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings modal
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });

      // Click theme dropdown to open it
      await page.locator('.settings-theme-dropdown').click();

      // Wait for dropdown menu to be visible
      await expect(page.locator('.fuzzy-dropdown-menu')).toBeVisible();

      // Find and click Monokai theme in the list
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Monokai$/ }).click();

      // Save settings
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Verify theme was saved to settings
      const savedSettings = await page.evaluate(() => {
        const settings = localStorage.getItem('gh_quick_review_settings');
        return settings ? JSON.parse(settings) : null;
      });
      expect(savedSettings.highlightTheme).toBe('monokai');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist theme selection across page reloads', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('gh_quick_review_settings', JSON.stringify({
          reviewSubmissionComment: '@copilot Read your agent file IN FULL before proceeding. Please address all PR comments below.',
          font: 'FiraCode',
          highlightTheme: 'monokai-sublime',
        }));
      });
      await page.reload();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Open settings modal
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });

      // Verify the theme dropdown shows the persisted value
      const themeDropdown = page.locator('.settings-theme-dropdown');
      await expect(themeDropdown).toContainText('Monokai Sublime');
    } finally {
      await mockServer.stop();
    }
  });

  test('should support fuzzy search in theme dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings modal
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });

      // Click theme dropdown to open it
      await page.locator('.settings-theme-dropdown').click();

      // Type to search for a specific theme
      await page.getByPlaceholder('Type to search...').fill('night owl');

      // Should show Night Owl in results
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: 'Night Owl' })).toBeVisible();

      // Should show fewer results than all 80 themes (fuzzy search should filter results)
      const listItems = await page.locator('.fuzzy-dropdown-option').count();
      expect(listItems).toBeLessThan(80); // Should be significantly filtered from 80 themes
    } finally {
      await mockServer.stop();
    }
  });

  test('should have all expected themes available', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings modal
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });

      // Click theme dropdown to open it
      await page.locator('.settings-theme-dropdown').click();

      // Wait for dropdown to open
      await expect(page.locator('.fuzzy-dropdown-menu')).toBeVisible();

      // Check for some popular themes
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Github$/ })).toBeVisible();
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Github Dark$/ })).toBeVisible();
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Monokai$/ })).toBeVisible();
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Vs$/ })).toBeVisible();
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Vs2015$/ })).toBeVisible();
      await expect(page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Atom One Dark$/ })).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });
});
