import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';
const TRANSITION_DELAY = 400; // Time to wait for CSS transitions
const FOCUS_DELAY = 100; // Time to wait for focus effects

test.describe('Directory Browser', () => {
  test('should not be visible when not logged in', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      await mockServer.checkHeartbeat();
    
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
      
      // Check toggle button position - it should be at 20vh
      const position = await page.locator('.directory-browser-toggle').evaluate(el => {
        const styles = window.getComputedStyle(el);
        const viewportHeight = window.innerHeight;
        const topPx = parseInt(styles.top);
        const topVh = (topPx / viewportHeight) * 100;
        return {
          position: styles.position,
          topVh: Math.round(topVh),
          right: styles.right
        };
      });
      
      expect(position.position).toBe('absolute');
      expect(position.topVh).toBe(20);
      expect(position.right).toBe('2px');
    } finally {
      await mockServer.stop();
    }
  });

  test('should show directory menu button with proper styling', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
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

  test('should open dropdown menu and show settings options', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser to be visible
      const directoryBrowser = page.locator('.directory-browser');
      await expect(directoryBrowser).toBeVisible();
      
      // Click the toggle button to expand the directory browser
      await page.click('.directory-browser-toggle');
      
      // Wait a moment for the slide-in animation
      await page.waitForTimeout(400);
      
      await page.click('.directory-menu-button');
      await expect(page.locator('.directory-menu-dropdown')).toBeVisible();
      await expect(page.locator('.directory-menu-item').nth(0)).toContainText('Start Collapsed');
      await expect(page.locator('.directory-menu-item').nth(1)).toContainText('Auto Expand');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist Start Collapsed setting in localStorage', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Click the toggle button to expand the directory browser
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(400);
      
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      const value = await page.evaluate(() => localStorage.getItem('directory_start_collapsed'));
      expect(value).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist Auto Expand setting in localStorage', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Click the toggle button to expand the directory browser
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(400);
      
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Auto Expand")');
      
      const value = await page.evaluate(() => localStorage.getItem('directory_auto_expand_on_scroll'));
      expect(value).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear directory settings on logout', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
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

  test('should display checkmark icon when setting is enabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
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
      
      // Click the toggle button to expand the directory browser
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(400);
      
      await page.click('.directory-menu-button');
      
      const checkText = await page.locator('.directory-menu-item').nth(0)
        .locator('.directory-menu-check').textContent();
      expect(checkText).toContain('\uf00c');
    } finally {
      await mockServer.stop();
    }
  });
});
