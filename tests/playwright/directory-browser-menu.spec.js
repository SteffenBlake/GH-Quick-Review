import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';
const MENU_ANIMATION_DELAY = 100; // Time to wait for menu animations

test.describe('Directory Browser Menu', () => {
  test('should show menu button when directory browser is visible', async ({ page }) => {
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
      
      // Menu button should be visible
      await expect(page.locator('.directory-menu-button')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should open dropdown when menu button is clicked', async ({ page }) => {
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
      
      // Wait for menu button to be visible
      await expect(page.locator('.directory-menu-button')).toBeVisible();
      
      // Dropdown should not exist initially (not just hidden)
      const dropdownExists = await page.locator('.directory-menu-dropdown').count();
      expect(dropdownExists).toBe(0);
      
      // Click menu button
      await page.click('.directory-menu-button');
      
      // Dropdown should now be visible
      await expect(page.locator('.directory-menu-dropdown')).toBeVisible();
      
      // Both menu items should be visible
      await expect(page.locator('.directory-menu-item').nth(0)).toContainText('Start Collapsed');
      await expect(page.locator('.directory-menu-item').nth(1)).toContainText('Auto Expand');
    } finally {
      await mockServer.stop();
    }
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
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
      
      // Open dropdown
      await page.click('.directory-menu-button');
      await expect(page.locator('.directory-menu-dropdown')).toBeVisible();
      
      // Click outside (on main content)
      await page.click('.content');
      
      // Dropdown should be removed from DOM
      const dropdownExists = await page.locator('.directory-menu-dropdown').count();
      expect(dropdownExists).toBe(0);
    } finally {
      await mockServer.stop();
    }
  });

  test('should store Start Collapsed setting in localStorage', async ({ page }) => {
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
      
      // Open dropdown and click Start Collapsed
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      // Verify localStorage is now set to true
      const storedValue = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      expect(storedValue).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should store Auto Expand setting in localStorage', async ({ page }) => {
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
      
      // Open dropdown and click Auto Expand
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Auto Expand")');
      
      // Verify localStorage is now set to true
      const storedValue = await page.evaluate(() => 
        localStorage.getItem('directory_auto_expand_on_scroll')
      );
      expect(storedValue).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should toggle Start Collapsed on and off', async ({ page }) => {
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
      
      // Enable Start Collapsed
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      let storedValue = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      expect(storedValue).toBe('true');
      
      // Wait a moment for menu to close
      await page.waitForTimeout(MENU_ANIMATION_DELAY);
      
      // Disable Start Collapsed
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      storedValue = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      expect(storedValue).toBe('false');
    } finally {
      await mockServer.stop();
    }
  });

  test('should display checkmark when Start Collapsed is enabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
        // Pre-enable the setting
        localStorage.setItem('directory_start_collapsed', 'true');
      });
      await page.reload();
      
      // Open menu
      await page.click('.directory-menu-button');
      
      // Get the checkmark element text
      const checkText = await page.locator('.directory-menu-item').nth(0)
        .locator('.directory-menu-check').textContent();
      
      // Should contain the checkmark character (Unicode U+F00C)
      expect(checkText).toContain('\uf00c');
    } finally {
      await mockServer.stop();
    }
  });

  test('should display checkmark when Auto Expand is enabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
        // Pre-enable the setting
        localStorage.setItem('directory_auto_expand_on_scroll', 'true');
      });
      await page.reload();
      
      // Open menu
      await page.click('.directory-menu-button');
      
      // Get the checkmark element text
      const checkText = await page.locator('.directory-menu-item').nth(1)
        .locator('.directory-menu-check').textContent();
      
      // Should contain the checkmark character
      expect(checkText).toContain('\uf00c');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist settings across page reloads', async ({ page }) => {
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
      
      // Enable both settings
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Auto Expand")');
      
      // Verify both are stored
      let startCollapsedValue = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      let autoExpandValue = await page.evaluate(() => 
        localStorage.getItem('directory_auto_expand_on_scroll')
      );
      expect(startCollapsedValue).toBe('true');
      expect(autoExpandValue).toBe('true');
      
      // Reload page
      await page.reload();
      
      // Verify settings are still in localStorage
      startCollapsedValue = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      autoExpandValue = await page.evaluate(() => 
        localStorage.getItem('directory_auto_expand_on_scroll')
      );
      expect(startCollapsedValue).toBe('true');
      expect(autoExpandValue).toBe('true');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear settings on logout', async ({ page }) => {
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
      
      // Enable both settings
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      
      await page.click('.directory-menu-button');
      await page.click('.directory-menu-item:has-text("Auto Expand")');
      
      // Verify settings are stored
      let storedStartCollapsed = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      let storedAutoExpand = await page.evaluate(() => 
        localStorage.getItem('directory_auto_expand_on_scroll')
      );
      expect(storedStartCollapsed).toBe('true');
      expect(storedAutoExpand).toBe('true');
      
      // Logout
      await page.click('button:has-text("Logout")');
      
      // Wait for redirect/reload
      await page.waitForLoadState('networkidle');
      
      // Verify settings are cleared
      storedStartCollapsed = await page.evaluate(() => 
        localStorage.getItem('directory_start_collapsed')
      );
      storedAutoExpand = await page.evaluate(() => 
        localStorage.getItem('directory_auto_expand_on_scroll')
      );
      expect(storedStartCollapsed).toBeNull();
      expect(storedAutoExpand).toBeNull();
    } finally {
      await mockServer.stop();
    }
  });

  test('should start with directories collapsed when Start Collapsed is enabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
        // Pre-enable Start Collapsed
        localStorage.setItem('directory_start_collapsed', 'true');
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Check if directories are collapsed (no children visible)
      // The directory tree should be visible but children should be hidden
      const childrenVisible = await page.locator('.directory-children').first().isVisible()
        .catch(() => false);
      
      // With Start Collapsed enabled, children should NOT be visible
      expect(childrenVisible).toBe(false);
    } finally {
      await mockServer.stop();
    }
  });

  test('should start with directories expanded when Start Collapsed is disabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_repo_1');
        localStorage.setItem('selected_pr', '1');
        // Start Collapsed is false by default
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Wait a moment for rendering
      await page.waitForTimeout(200);
      
      // Check if at least one directory has visible children
      // (This assumes the test data has at least one directory with children)
      const childrenCount = await page.locator('.directory-children').count();
      
      // With Start Collapsed disabled (default), we should see directory children
      expect(childrenCount).toBeGreaterThan(0);
    } finally {
      await mockServer.stop();
    }
  });

  test('should have proper menu button styling (dark background, outline)', async ({ page }) => {
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
      
      // Get computed styles of menu button
      const buttonStyles = await page.locator('.directory-menu-button').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          borderStyle: styles.borderStyle,
          borderWidth: styles.borderWidth,
          cursor: styles.cursor
        };
      });
      
      // Should have background color (dark)
      expect(buttonStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(buttonStyles.backgroundColor).not.toBe('transparent');
      
      // Should have border
      expect(buttonStyles.borderStyle).toBe('solid');
      expect(buttonStyles.borderWidth).not.toBe('0px');
      
      // Should have pointer cursor
      expect(buttonStyles.cursor).toBe('pointer');
    } finally {
      await mockServer.stop();
    }
  });

  test('should have fixed-width space for unchecked options', async ({ page }) => {
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
      
      // Open dropdown
      await page.click('.directory-menu-button');
      
      // Get width of checkmark element when unchecked
      const checkWidth = await page.locator('.directory-menu-item').nth(0)
        .locator('.directory-menu-check').evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            width: styles.width,
            display: styles.display
          };
        });
      
      // Should have a fixed width (not auto)
      expect(checkWidth.width).not.toBe('auto');
      expect(checkWidth.display).toBe('inline-block');
    } finally {
      await mockServer.stop();
    }
  });

  test('should have consistent width for checked and unchecked options', async ({ page }) => {
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
      
      // Open dropdown and get unchecked width
      await page.click('.directory-menu-button');
      const uncheckedWidth = await page.locator('.directory-menu-item').nth(0)
        .locator('.directory-menu-check').evaluate(el => {
          return window.getComputedStyle(el).width;
        });
      
      // Enable the option
      await page.click('.directory-menu-item:has-text("Start Collapsed")');
      await page.waitForTimeout(MENU_ANIMATION_DELAY);
      
      // Re-open and get checked width
      await page.click('.directory-menu-button');
      const checkedWidth = await page.locator('.directory-menu-item').nth(0)
        .locator('.directory-menu-check').evaluate(el => {
          return window.getComputedStyle(el).width;
        });
      
      // Widths should be the same
      expect(uncheckedWidth).toBe(checkedWidth);
    } finally {
      await mockServer.stop();
    }
  });
});
