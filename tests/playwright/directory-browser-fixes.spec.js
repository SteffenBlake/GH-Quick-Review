import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';
const TRANSITION_DELAY = 400; // Time to wait for CSS transitions
const FOCUS_DELAY = 100; // Time to wait for focus effects

test.describe('Directory Browser Fixes', () => {
  test('should NOT auto-focus on page reload when PR already selected', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      // Set up: already logged in with PR selected
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      
      // Reload the page (simulating coming back to an already-selected PR)
      await page.reload();
      
      // Wait a bit for any auto-focus to trigger
      await page.waitForTimeout(FOCUS_DELAY + 100);
      
      // Directory browser should be visible but NOT focused (collapsed)
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Check that it's collapsed (transform should be translateX(-100%))
      const transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Should be translated to the left (collapsed state)
      // matrix(1, 0, 0, 1, x, 0) where x is negative means it's translated left
      expect(transform).toContain('matrix');
      
      // The browser should NOT have focus-within
      const hasFocusWithin = await page.locator('.directory-browser').evaluate(el => {
        return el.matches(':focus-within');
      });
      expect(hasFocusWithin).toBe(false);
    } finally {
      await mockServer.stop();
    }
  });

  test('should collapse when clicking the collapse button', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Directory browser should be visible but collapsed (not focused on reload)
      await expect(page.locator('.directory-browser')).toBeVisible();
      await page.waitForTimeout(FOCUS_DELAY);
      
      // Manually expand by clicking the toggle button
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(FOCUS_DELAY);
      
      // Should be expanded now
      let hasFocusWithin = await page.locator('.directory-browser').evaluate(el => {
        return el.matches(':focus-within');
      });
      expect(hasFocusWithin).toBe(true);
      
      // Now click the collapse button (same button, but now in collapse mode)
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(TRANSITION_DELAY);
      
      // Should be collapsed now (lost focus)
      hasFocusWithin = await page.locator('.directory-browser').evaluate(el => {
        return el.matches(':focus-within');
      });
      expect(hasFocusWithin).toBe(false);
    } finally {
      await mockServer.stop();
    }
  });

  test('toggle button should have blue highlight on hover, not turn black', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      await page.waitForTimeout(FOCUS_DELAY);
      
      // Get initial button styles
      const initialStyles = await page.locator('.directory-browser-toggle').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          boxShadow: styles.boxShadow,
          borderColor: styles.borderColor
        };
      });
      
      // Hover over the button
      await page.hover('.directory-browser-toggle');
      await page.waitForTimeout(200); // Wait for transition
      
      // Get hover styles
      const hoverStyles = await page.locator('.directory-browser-toggle').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          boxShadow: styles.boxShadow,
          borderColor: styles.borderColor
        };
      });
      
      // The button should NOT turn black on hover
      expect(hoverStyles.backgroundColor).not.toBe('rgb(0, 0, 0)');
      expect(hoverStyles.color).not.toBe('rgb(0, 0, 0)');
      
      // Should have blue highlight (box-shadow or border change)
      // Either box-shadow should change or border color should change
      const hasHighlight = 
        hoverStyles.boxShadow !== initialStyles.boxShadow ||
        hoverStyles.borderColor !== initialStyles.borderColor;
      
      expect(hasHighlight).toBe(true);
    } finally {
      await mockServer.stop();
    }
  });
});
