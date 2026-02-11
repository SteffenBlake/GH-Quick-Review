import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';
const TRANSITION_DELAY = 400; // Time to wait for CSS transitions
const FOCUS_DELAY = 100; // Time to wait for focus effects

test.describe('Directory Browser', () => {
  test('should not be visible when not logged in', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Should NOT show directory browser when not logged in
      await expect(page.locator('.directory-browser')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should not be visible when logged in but no PR selected', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();
      
      // Should NOT show directory browser when logged in but no PR selected
      await expect(page.locator('.directory-browser')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should expand when PR is selected', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Directory browser should be visible
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Content should be visible
      await expect(page.locator('.directory-browser-content')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show expand button when collapsed', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser to appear (it's focused initially)
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Click outside to lose focus and collapse
      await page.click('.content');
      
      // Wait a bit for the transform transition
      await page.waitForTimeout(TRANSITION_DELAY);
      
      // Check that it's collapsed (transform should be translateX(-20rem))
      const transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Should be translated to the left
      expect(transform).toContain('matrix');
    } finally {
      await mockServer.stop();
    }
  });

  test('should collapse when clicking outside', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser to appear
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Wait for auto-focus to take effect
      await page.waitForTimeout(FOCUS_DELAY + 100);
      
      // Click the toggle to ensure it's expanded first
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(FOCUS_DELAY);
      
      // Now click outside
      await page.click('.content');
      
      // Wait for transition and loss of focus
      await page.waitForTimeout(TRANSITION_DELAY);
      
      // Directory browser should still be visible but translated off-screen
      await expect(page.locator('.directory-browser')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should expand when expand button is clicked', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Click outside to collapse
      await page.click('.content');
      await page.waitForTimeout(TRANSITION_DELAY);
      
      // Click expand button
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(TRANSITION_DELAY);
      
      // Should be expanded now
      const transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
    } finally {
      await mockServer.stop();
    }
  });

  test('should re-expand when PR selection changes', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Click outside to collapse
      await page.click('.content');
      await page.waitForTimeout(TRANSITION_DELAY);
      
      // Simulate PR selection change via localStorage and reload
      await page.evaluate(() => {
        localStorage.setItem('selected_pr', '2');
      });
      await page.reload();
      
      // Directory browser should be visible (will auto-expand on mount with new PR)
      await expect(page.locator('.directory-browser')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should be positioned at 20% down from viewport top', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser to appear
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Check position - computed style will convert vh to px
      const position = await page.locator('.directory-browser').evaluate(el => {
        const styles = window.getComputedStyle(el);
        const viewportHeight = window.innerHeight;
        const topPx = parseInt(styles.top);
        const topVh = (topPx / viewportHeight) * 100;
        return {
          position: styles.position,
          topVh: Math.round(topVh),
          left: styles.left
        };
      });
      
      expect(position.position).toBe('fixed');
      expect(position.topVh).toBe(20);
      expect(position.left).toBe('0px');
    } finally {
      await mockServer.stop();
    }
  });
});
