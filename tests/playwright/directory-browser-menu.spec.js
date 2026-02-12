import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';

test.describe('Directory Browser Menu', () => {
  test('should show menu button with proper styling', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await expect(page.locator('.directory-browser')).toBeVisible();
      await expect(page.locator('.directory-menu-button')).toBeVisible();
      
      const buttonStyles = await page.locator('.directory-menu-button').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          cursor: styles.cursor,
          borderStyle: styles.borderStyle
        };
      });
      
      expect(buttonStyles.cursor).toBe('pointer');
      expect(buttonStyles.borderStyle).toBe('solid');
    } finally {
      await mockServer.stop();
    }
  });

  test('should open dropdown and show both settings options', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await page.click('.directory-menu-button');
      await expect(page.locator('.directory-menu-dropdown')).toBeVisible();
      await expect(page.locator('.directory-menu-item').nth(0)).toContainText('Start Collapsed');
      await expect(page.locator('.directory-menu-item').nth(1)).toContainText('Auto Expand');
    } finally {
      await mockServer.stop();
    }
  });

  test('should toggle and persist Start Collapsed setting', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      const value = await page.evaluate(() => localStorage.getItem('directory_start_collapsed'));
      expect(value).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should toggle and persist Auto Expand setting', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Auto Expand")');
      
      const value = await page.evaluate(() => localStorage.getItem('directory_auto_expand_on_scroll'));
      expect(value).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear settings on logout', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
        // Pre-set settings
        localStorage.setItem('directory_start_collapsed', 'true');
        localStorage.setItem('directory_auto_expand_on_scroll', 'true');
      });
      await page.reload();
      
      await page.click('button:has-text("Logout")');
      await page.waitForLoadState('networkidle');
      
      const startCollapsed = await page.evaluate(() => localStorage.getItem('directory_start_collapsed'));
      const autoExpand = await page.evaluate(() => localStorage.getItem('directory_auto_expand_on_scroll'));
      expect(startCollapsed).toBeNull();
      expect(autoExpand).toBeNull();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display checkmark when setting is enabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
        localStorage.setItem('directory_start_collapsed', 'true');
      });
      await page.reload();
      
      await page.click('.directory-menu-button');
      
      const checkText = await page.locator('.directory-menu-item').nth(0)
        .locator('.directory-menu-check').textContent();
      expect(checkText).toContain('\uf00c');
    } finally {
      await mockServer.stop();
    }
  });
});
