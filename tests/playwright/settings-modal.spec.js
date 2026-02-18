import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';
const DEFAULT_COMMENT = '@copilot Read your agent file IN FULL before proceeding. Please address all PR comments below.';

test.describe('Settings Modal', { tag: '@parallel' }, () => {
  test('should show settings button only when logged in', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Settings button should NOT exist when logged out
      const settingsButton = page.locator('.header-settings-button');
      await expect(settingsButton).not.toBeVisible();

      // Log in
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Settings button should exist when logged in
      await expect(settingsButton).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should close via cancel button and reopen', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      const settingsButton = page.locator('.header-settings-button');
      const modal = page.locator('.settings-modal');

      // Open modal
      await settingsButton.click();
      await expect(modal).toBeFocused({ timeout: 1000 });

      // Close via Cancel button
      await page.getByRole('button', { name: 'Cancel' }).nth(1).click();
      await page.waitForTimeout(200);
      await expect(modal).not.toBeFocused();

      // Reopen - should work
      await settingsButton.click();
      await expect(modal).toBeFocused({ timeout: 1000 });

      // Should have Settings heading
      const heading = page.getByRole('heading', { name: / Settings/ });
      await expect(heading).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should close when clicking off modal and reopen', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      const settingsButton = page.locator('.header-settings-button');
      const modal = page.locator('.settings-modal');

      // Open modal
      await settingsButton.click();
      await expect(modal).toBeFocused({ timeout: 1000 });

      // Click outside the modal (on the body element, which should blur the modal)
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(200);
      await expect(modal).not.toBeFocused();

      // Reopen - should work (THIS IS THE BUG)
      await settingsButton.click();
      await expect(modal).toBeFocused({ timeout: 1000 });

      // Should have Settings heading
      const heading = page.getByRole('heading', { name: / Settings/ });
      await expect(heading).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display default review comment', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings
      await page.locator('.header-settings-button').click();

      // Check default value
      const textarea = page.getByRole('textbox').nth(1);
      await expect(textarea).toHaveValue(DEFAULT_COMMENT);
    } finally {
      await mockServer.stop();
    }
  });

  test('should save custom settings', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings
      await page.locator('.header-settings-button').click();
      await page.waitForTimeout(400); // Wait for modal to fully open and render

      // Change the value
      const customComment = 'My custom review comment';
      await page.getByTestId('review-comment-textarea').fill(customComment);

      // Save
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Reopen settings to verify it was saved
      await page.locator('.header-settings-button').click();
      await page.waitForTimeout(600); // Wait for modal animation (300ms) + render + buffer
      await expect(page.getByTestId('review-comment-textarea')).toHaveValue(customComment);
    } finally {
      await mockServer.stop();
    }
  });

  test('should cancel changes without saving', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings
      await page.locator('.header-settings-button').click();

      // Change the value
      const textarea = page.getByRole('textbox').nth(1);
      await textarea.fill('Temporary change');

      // Cancel
      await page.getByRole('button', { name: 'Cancel' }).nth(1).click();

      // Reopen settings to verify it wasn't saved
      await page.locator('.header-settings-button').click();
      await expect(textarea).toHaveValue(DEFAULT_COMMENT);
    } finally {
      await mockServer.stop();
    }
  });

  test('should reset to defaults', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings and save custom value
      await page.locator('.header-settings-button').click();
      const textarea = page.getByRole('textbox').nth(1);
      await textarea.fill('Custom value');
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Reopen and click Reset to Defaults
      await page.locator('.header-settings-button').click();
      await page.getByRole('button', { name: 'Reset to Defaults' }).click();

      // Should show default value
      await expect(textarea).toHaveValue(DEFAULT_COMMENT);

      // Save the reset
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Verify it was saved
      await page.locator('.header-settings-button').click();
      await expect(textarea).toHaveValue(DEFAULT_COMMENT);
    } finally {
      await mockServer.stop();
    }
  });

  test('should reset font and highlight theme to defaults', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings modal
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });

      // Change font to JetBrains Mono
      await page.locator('.settings-font-dropdown').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: 'JetBrains Mono' }).click();

      // Change theme to Monokai
      await page.locator('.settings-theme-dropdown').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Monokai$/ }).click();

      // Save changes
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Reopen settings and verify changes were saved
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.settings-font-dropdown')).toContainText('JetBrains Mono');
      await expect(page.locator('.settings-theme-dropdown')).toContainText('Monokai');

      // Click Reset to Defaults
      await page.getByRole('button', { name: 'Reset to Defaults' }).click();

      // Should show default values without saving
      await expect(page.locator('.settings-font-dropdown')).toContainText('Fira Code');
      await expect(page.locator('.settings-theme-dropdown')).toContainText('Github Dark');

      // Save the reset
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Reopen and verify defaults were saved
      await page.locator('.header-settings-button').click();
      await expect(page.locator('.settings-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.settings-font-dropdown')).toContainText('Fira Code');
      await expect(page.locator('.settings-theme-dropdown')).toContainText('Github Dark');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear settings on logout', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings and save custom value
      await page.locator('.header-settings-button').click();
      const customComment = 'Custom comment before logout';
      const textarea = page.getByRole('textbox').nth(1);
      await textarea.fill(customComment);
      await page.getByRole('button', { name: 'Save' }).click();

      // Logout
      await page.getByRole('button', { name: 'Logout 󰗽' }).click();

      // Log back in
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings - should be back to defaults
      await page.locator('.header-settings-button').click();
      await expect(textarea).toHaveValue(DEFAULT_COMMENT);
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist settings across page reload', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();

    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();

      // Open settings and save custom value
      await page.locator('.header-settings-button').click();
      await page.waitForTimeout(400); // Wait for modal to fully open
      const customComment = 'Persisted custom comment';
      await page.getByTestId('review-comment-textarea').fill(customComment);
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Reload the page
      await page.reload();

      // Open settings - should still have custom value
      await page.locator('.header-settings-button').click();
      await page.waitForTimeout(600); // Wait for modal animation + render
      await expect(page.getByTestId('review-comment-textarea')).toHaveValue(customComment);
    } finally {
      await mockServer.stop();
    }
  });
});
