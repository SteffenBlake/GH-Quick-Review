import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Directory Browser', () => {
  test('should not be visible when not logged in', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
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
      await page.goto('/GH-Quick-Review/');
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
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();
      
      // Wait for repos to load and select one
      await page.waitForSelector('.repo-select');
      await page.selectOption('.repo-select', 'test_repo_1');
      
      // Wait for pulls to load and select one
      await page.waitForSelector('.pr-select');
      await page.selectOption('.pr-select', '1');
      
      // Directory browser should now be visible and expanded (transformed to 0)
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      const transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // When expanded, should be translateX(0) which is "none" in computed style
      expect(transform).toBe('none');
    } finally {
      await mockServer.stop();
    }
  });

  test('should show expand button when collapsed', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
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
      await page.waitForTimeout(400);
      
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
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser to appear
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Should be expanded (focused) initially
      let transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).toBe('none');
      
      // Click outside
      await page.click('.content');
      
      // Wait for transition
      await page.waitForTimeout(400);
      
      // Should now be collapsed (translated)
      transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).toContain('matrix');
    } finally {
      await mockServer.stop();
    }
  });

  test('should expand when expand button is clicked', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
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
      await page.waitForTimeout(400);
      
      // Click expand button
      await page.click('.directory-browser-toggle');
      await page.waitForTimeout(400);
      
      // Should be expanded now
      const transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).toBe('none');
    } finally {
      await mockServer.stop();
    }
  });

  test('should re-expand when PR selection changes', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Collapse it by clicking outside
      await page.click('.content');
      await page.waitForTimeout(400);
      
      // Should be collapsed
      let transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).toContain('matrix');
      
      // Change PR selection
      await page.selectOption('.pr-select', '2');
      
      // Wait a moment for the focus effect
      await page.waitForTimeout(100);
      
      // Should expand again
      transform = await page.locator('.directory-browser').evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).toBe('none');
    } finally {
      await mockServer.stop();
    }
  });

  test('should be positioned at 20% down from viewport top', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
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
          topVh: Math.round(topVh), // Round to nearest integer
          left: styles.left
        };
      });
      
      expect(position.position).toBe('fixed');
      expect(position.topVh).toBe(20); // 20vh
      expect(position.left).toBe('0px');
    } finally {
      await mockServer.stop();
    }
  });
});
