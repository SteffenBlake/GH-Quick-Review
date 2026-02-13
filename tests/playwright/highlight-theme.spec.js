import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

/**
 * Highlight Theme Tests
 * Ensures the highlight theme dropdown works correctly and persists selection
 */
test.describe('Highlight Theme', { tag: '@parallel' }, () => {
  test('should display theme dropdown with default value', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Theme dropdown should be visible even before login
      const themeDropdown = page.locator('.theme-fuzzy-select');
      await expect(themeDropdown).toBeVisible();
      
      // Should show default theme 'github-dark' in UI
      await expect(themeDropdown).toContainText('Github Dark');
      
      // Verify localStorage has the default value after interaction
      const themeValue = await page.evaluate(() => localStorage.getItem('highlight_theme'));
      // Initially null until user interacts, then defaults to 'github-dark'
      expect(themeValue === null || themeValue === 'github-dark').toBeTruthy();
    } finally {
      await mockServer.stop();
    }
  });

  test('should allow selecting a different theme', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Click theme dropdown to open it
      await page.locator('.theme-fuzzy-select').click();
      
      // Wait for dropdown menu to be visible
      await expect(page.locator('.fuzzy-dropdown-menu')).toBeVisible();
      
      // Find and click Monokai theme in the list
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Monokai$/ }).click();
      
      // Verify theme was saved to localStorage
      const savedTheme = await page.evaluate(() => localStorage.getItem('highlight_theme'));
      expect(savedTheme).toBe('monokai');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist theme selection across page reloads', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('highlight_theme', 'monokai-sublime');
      });
      await page.reload();
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify the theme dropdown shows the persisted value
      const themeDropdown = page.locator('.theme-fuzzy-select');
      await expect(themeDropdown).toContainText('Monokai Sublime');
    } finally {
      await mockServer.stop();
    }
  });

  test('should support fuzzy search in theme dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Click theme dropdown to open it
      await page.locator('.theme-fuzzy-select').click();
      
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
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Click theme dropdown to open it
      await page.locator('.theme-fuzzy-select').click();
      
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
