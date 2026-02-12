import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';

test.describe('Bug Fixes - Directory Scrolling and Comment Icons', () => {
  test('should show MessageAlert icon on lines with comments', async ({ page }) => {
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
      
      // Wait for diff viewer to load
      await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.diff-line').first()).toBeVisible();
      
      // Check that MessageAlert buttons exist for lines with comments
      // Based on test data, example.js has comments
      const hasMessageButtons = page.locator('.diff-line-message-btn.has-message');
      const count = await hasMessageButtons.count();
      
      // There should be at least one line with a comment
      expect(count).toBeGreaterThan(0);
      
      // Verify the MessageAlert icon is showing on at least one line
      const firstHasMessageBtn = hasMessageButtons.first();
      const iconText = await firstHasMessageBtn.textContent();
      expect(iconText).toBe('\udb80\udf62'); // MessageAlert icon
      
      // Verify it's always visible (not display: none)
      const isVisible = await firstHasMessageBtn.isVisible();
      expect(isVisible).toBe(true);
    } finally {
      await mockServer.stop();
    }
  });

  test('should show MessageAlert always, MessagePlus only on hover', async ({ page }) => {
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
      
      // Wait for diff viewer
      await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.diff-line').first()).toBeVisible();
      
      // Find a line WITH a comment (has-message)
      const hasMessageBtn = page.locator('.diff-line-message-btn.has-message').first();
      await expect(hasMessageBtn).toBeVisible();
      
      // Find a line WITHOUT a comment (add-message)
      const addMessageBtn = page.locator('.diff-line-message-btn.add-message').first();
      
      // Check that add-message is NOT visible initially (before hover)
      const isHiddenInitially = await addMessageBtn.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.display === 'none';
      });
      expect(isHiddenInitially).toBe(true);
      
      // Hover over the parent line
      const parentLine = page.locator('.diff-line').filter({ has: addMessageBtn }).first();
      await parentLine.hover();
      
      // Now check that .add-message button IS visible
      const isVisibleOnHover = await addMessageBtn.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.display !== 'none';
      });
      expect(isVisibleOnHover).toBe(true);
    } finally {
      await mockServer.stop();
    }
  });
});
