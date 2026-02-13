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

  test('should open and close settings modal', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();
      
      // Click settings button
      const settingsButton = page.locator('.header-settings-button');
      await settingsButton.click();
      
      // Modal should be visible
      const modal = page.locator('.settings-modal');
      await expect(modal).toBeFocused({ timeout: 1000 });
      
      // Should have Settings heading with gear icon
      const heading = page.getByRole('heading', { name: / Settings/ });
      await expect(heading).toBeVisible();
      
      // Click Cancel to close
      await page.getByRole('button', { name: 'Cancel' }).nth(1).click();
      
      // Wait a moment for blur to complete
      await page.waitForTimeout(200);
      
      // Modal should not be focused anymore (closed)
      await expect(modal).not.toBeFocused();
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
      
      // Change the value
      const customComment = 'My custom review comment';
      const textarea = page.getByRole('textbox').nth(1);
      await textarea.fill(customComment);
      
      // Save
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Wait for modal to close
      await page.waitForTimeout(500);
      
      // Reopen settings to verify it was saved
      await page.locator('.header-settings-button').click();
      await expect(textarea).toHaveValue(customComment);
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
      const customComment = 'Persisted custom comment';
      const textarea = page.getByRole('textbox').nth(1);
      await textarea.fill(customComment);
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Wait for modal to close
      await expect(page.locator('.settings-modal')).not.toBeVisible();
      
      // Reload the page
      await page.reload();
      
      // Open settings - should still have custom value
      await page.locator('.header-settings-button').click();
      await expect(textarea).toHaveValue(customComment);
    } finally {
      await mockServer.stop();
    }
  });
});
